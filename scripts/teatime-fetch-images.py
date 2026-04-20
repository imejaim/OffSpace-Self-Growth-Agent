#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os, io, sys
os.environ.setdefault("PYTHONIOENCODING", "utf-8")
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")
"""
teatime-fetch-images.py

티타임 MD 파일의 이미지 URL을 로컬로 다운로드하고 상대 경로로 전환합니다.

사용법:
    python scripts/teatime-fetch-images.py output/teatime/2026-04-20_AI동향_티타임.md

동작:
    1. MD 파일에서 ![...](external-url) 패턴 추출
    2. 각 기사 URL의 og:image 크롤링 (이미지 URL이 404인 경우)
    3. HTTP 200 이미지만 output/teatime/images/YYYY-MM-DD/{slug}.ext 로 저장
    4. MD 내 이미지 블록을 로컬 경로로 치환
    5. 각 이미지 아래 "> 출처: {매체명}" 캡션 삽입
    6. 실패 건은 로그 출력 + MD에서 해당 이미지 블록 제거

의존성: requests, beautifulsoup4
    pip install requests beautifulsoup4
"""

import os
import re
import sys
import hashlib
import mimetypes
from pathlib import Path
from urllib.parse import urlparse

# pip install requests beautifulsoup4 필요
try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("[ERROR] 의존성 누락. 다음 명령어로 설치하세요:")
    print("  pip install requests beautifulsoup4")
    sys.exit(1)

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    )
}
TIMEOUT = 15


def slugify(text: str, maxlen: int = 40) -> str:
    """간단한 slug 생성"""
    text = re.sub(r"[^\w\-.]", "-", text)
    text = re.sub(r"-+", "-", text).strip("-")
    return text[:maxlen].lower()


def get_ext_from_url(url: str, content_type: str = "") -> str:
    """URL 또는 Content-Type에서 확장자 추출"""
    path = urlparse(url).path
    ext = Path(path).suffix.lower()
    if ext in (".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".svg"):
        return ext
    if content_type:
        ext_from_ct = mimetypes.guess_extension(content_type.split(";")[0].strip())
        if ext_from_ct:
            return ext_from_ct
    return ".jpg"


def check_image_url(url: str) -> tuple:
    """이미지 URL HTTP 상태 확인. (status_code, content_type, content) 반환"""
    try:
        r = requests.get(url, headers=HEADERS, timeout=TIMEOUT, stream=True)
        if r.status_code == 200:
            ct = r.headers.get("Content-Type", "")
            if "image" in ct or "octet-stream" in ct:
                return 200, ct, r.content
            # Content-Type이 image가 아니어도 URL 확장자로 판단
            if any(url.lower().endswith(e) for e in [".jpg", ".jpeg", ".png", ".webp", ".gif"]):
                return 200, ct, r.content
        return r.status_code, "", b""
    except Exception as e:
        return -1, "", b""


def fetch_og_image(page_url: str) -> str:
    """기사 페이지에서 og:image URL 추출"""
    try:
        r = requests.get(page_url, headers=HEADERS, timeout=TIMEOUT)
        if r.status_code != 200:
            return ""
        soup = BeautifulSoup(r.text, "html.parser")
        # og:image
        tag = soup.find("meta", property="og:image")
        if tag and tag.get("content"):
            return tag["content"]
        # twitter:image
        tag = soup.find("meta", attrs={"name": "twitter:image"})
        if tag and tag.get("content"):
            return tag["content"]
        # 첫 번째 큰 이미지
        for img in soup.find_all("img"):
            src = img.get("src", "")
            if src.startswith("http") and any(
                kw in src for kw in ["content/images", "wp-content", "cdn", "media", "photo", "image"]
            ):
                return src
        return ""
    except Exception:
        return ""


def extract_source_name(md_line: str, alt_text: str) -> str:
    """이미지 alt 텍스트 또는 MD 컨텍스트에서 출처 매체명 추출"""
    # alt 텍스트에서 마지막 단어 그룹 추출 시도
    if alt_text and len(alt_text) > 5:
        return alt_text[:60]
    return "출처 미확인"


def process_file(md_path: str) -> None:
    md_path = Path(md_path).resolve()
    if not md_path.exists():
        print(f"[ERROR] 파일 없음: {md_path}")
        sys.exit(1)

    # 날짜 추출 (파일명에서)
    date_match = re.search(r"(\d{4}-\d{2}-\d{2})", md_path.name)
    if not date_match:
        print(f"[ERROR] 파일명에서 날짜 추출 실패: {md_path.name}")
        sys.exit(1)
    date_str = date_match.group(1)

    # 이미지 저장 디렉토리
    img_dir = md_path.parent / "images" / date_str
    img_dir.mkdir(parents=True, exist_ok=True)

    content = md_path.read_text(encoding="utf-8")

    # 이미지 블록 패턴: ![alt](url)
    img_pattern = re.compile(r"(!\[([^\]]*)\]\((https?://[^\)]+)\))")

    matches = list(img_pattern.finditer(content))
    print(f"\n[INFO] {md_path.name} — 이미지 블록 {len(matches)}개 발견")

    replacements = []  # (original_str, new_str)
    log = []

    for i, m in enumerate(matches):
        full_match = m.group(1)
        alt_text = m.group(2)
        img_url = m.group(3).strip()

        print(f"\n  [{i+1}] alt: {alt_text[:50]}")
        print(f"       url: {img_url[:80]}")

        # 1. 현재 URL 직접 확인
        status, ct, data = check_image_url(img_url)
        resolved_url = img_url
        resolved_data = data

        if status != 200:
            print(f"       -> {status} (직접 실패) — og:image 크롤링 시도")
            # 2. 이전 링크 섹션에서 첫 번째 기사 URL 찾기
            # md에서 이 이미지 블록 앞쪽의 가장 가까운 기사 링크 탐색
            pos = m.start()
            preceding = content[:pos]
            link_matches = list(re.finditer(r"\[([^\]]+)\]\((https?://[^\)]+)\)", preceding))
            page_url = ""
            if link_matches:
                # 가장 가까운 링크 (뒤에서부터)
                page_url = link_matches[-1].group(2)

            # 이미지 바로 아래 참고 링크 섹션도 탐색
            following = content[pos:]
            flink = re.search(r"\[([^\]]+)\]\((https?://[^\)]+)\)", following[len(full_match):])
            # 기사 이미지이므로 img_url 도메인과 같은 도메인의 기사 페이지를 우선 탐색
            # — 실용적으로: 해당 섹션 참고링크 중 ★★★★★ 최고 등급 링크 사용
            section_after = content[pos:pos+3000]
            star5_match = re.search(r"\[(https?://[^\)]+)\].*?★★★★★", section_after)
            # 참고 링크 섹션 파싱
            ref_links = re.findall(r">\s*-\s*\[([^\]]+)\]\((https?://[^\)]+)\)", section_after[:2000])

            best_page = ""
            if ref_links:
                # 5스타 우선
                star5_ref = [(t, u) for t, u in ref_links if "★★★★★" in section_after[section_after.find(u):section_after.find(u)+100]]
                # 간단하게 첫 번째 링크 사용
                best_page = ref_links[0][1] if ref_links else ""

            if not best_page and page_url:
                best_page = page_url

            og_img = ""
            if best_page:
                print(f"       -> 기사 페이지 크롤링: {best_page[:70]}")
                og_img = fetch_og_image(best_page)

            if og_img:
                print(f"       -> og:image: {og_img[:80]}")
                status2, ct2, data2 = check_image_url(og_img)
                if status2 == 200:
                    resolved_url = og_img
                    resolved_data = data2
                    ct = ct2
                    print(f"       -> og:image 다운로드 성공")
                else:
                    print(f"       -> og:image도 실패 ({status2})")
                    resolved_data = b""
            else:
                print(f"       -> og:image 추출 실패")
                resolved_data = b""

        if not resolved_data:
            log.append(f"FAIL [{i+1}] {img_url[:80]}")
            print(f"       -> 이미지 블록 제거 (가짜 이미지 잔존 금지)")
            # 이미지 블록 제거 (줄 전체 + 빈 줄 처리)
            replacements.append((full_match, ""))
            continue

        # 3. 로컬 저장
        ext = get_ext_from_url(resolved_url, ct)
        if ext == ".jpeg":
            ext = ".jpg"
        slug = slugify(alt_text) if alt_text else f"image-{i+1}"
        if not slug or slug == "-":
            slug = f"image-{i+1}"
        filename = f"{slug}{ext}"
        save_path = img_dir / filename

        # 중복 파일명 처리
        if save_path.exists():
            h = hashlib.md5(resolved_data).hexdigest()[:6]
            filename = f"{slug}-{h}{ext}"
            save_path = img_dir / filename

        save_path.write_bytes(resolved_data)
        print(f"       -> 저장: images/{date_str}/{filename} ({len(resolved_data)//1024}KB)")

        # 4. 상대 경로로 치환 + 캡션 추가
        rel_path = f"./images/{date_str}/{filename}"
        new_img_tag = f"![{alt_text}]({rel_path})"

        # 출처 캡션: alt 텍스트 또는 기사 매체명
        source_name = alt_text if alt_text else "출처 미확인"
        caption = f"\n> 출처: {source_name}"

        replacements.append((full_match, new_img_tag + caption))
        log.append(f"OK  [{i+1}] -> images/{date_str}/{filename}")

    # 5. 치환 적용
    new_content = content
    for original, replacement in replacements:
        if replacement == "":
            # 이미지 블록 + 바로 앞뒤 빈 줄 정리
            new_content = new_content.replace("\n" + original + "\n", "\n")
            new_content = new_content.replace(original + "\n", "")
            new_content = new_content.replace(original, "")
        else:
            new_content = new_content.replace(original, replacement)

    md_path.write_text(new_content, encoding="utf-8")

    print(f"\n{'='*50}")
    print(f"  결과 요약:")
    for entry in log:
        print(f"    {entry}")
    ok_count = sum(1 for e in log if e.startswith("OK"))
    fail_count = sum(1 for e in log if e.startswith("FAIL"))
    print(f"\n  성공: {ok_count}개 / 실패: {fail_count}개")
    print(f"  파일 업데이트: {md_path}")
    print(f"{'='*50}\n")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python scripts/teatime-fetch-images.py <md-file-path>")
        sys.exit(1)
    process_file(sys.argv[1])
