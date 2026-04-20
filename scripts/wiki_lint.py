#!/usr/bin/env python3
"""Lightweight lint checks for the project wiki."""

from __future__ import annotations

import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
WIKI_ROOT = ROOT / "docs" / "wiki"
INDEX_FILE = WIKI_ROOT / "index.md"
LOG_FILE = WIKI_ROOT / "log.md"
SCHEMA_FILE = WIKI_ROOT / "SCHEMA.md"


def markdown_links(text: str) -> list[str]:
    return re.findall(r"\[[^\]]+\]\(([^)]+)\)", text)


def page_title(path: Path) -> str:
    for line in path.read_text(encoding="utf-8").splitlines():
        if line.startswith("# "):
            return line[2:].strip()
    return path.stem


def iter_wiki_pages() -> list[Path]:
    pages: list[Path] = []
    for path in sorted(WIKI_ROOT.rglob("*.md")):
        if path.name in {"index.md", "log.md", "SCHEMA.md"}:
            continue
        pages.append(path)
    return pages


def check_required_files(errors: list[str]) -> None:
    for required in (INDEX_FILE, LOG_FILE, SCHEMA_FILE):
        if not required.exists():
            errors.append(f"Missing required wiki file: {required.relative_to(ROOT)}")


def check_relative_links(errors: list[str]) -> None:
    for path in [INDEX_FILE, LOG_FILE, SCHEMA_FILE, *iter_wiki_pages()]:
        if not path.exists():
            continue
        text = path.read_text(encoding="utf-8")
        for link in markdown_links(text):
            if "://" in link or link.startswith("#"):
                continue
            target = (path.parent / link).resolve()
            if not target.exists():
                errors.append(
                    f"Broken relative link in {path.relative_to(ROOT)} -> {link}"
                )


def check_index_coverage(errors: list[str]) -> None:
    if not INDEX_FILE.exists():
        return
    index_text = INDEX_FILE.read_text(encoding="utf-8")
    for page in iter_wiki_pages():
        rel = page.relative_to(WIKI_ROOT).as_posix()
        needle = f"./{rel}"
        if needle not in index_text:
            errors.append(f"Wiki page missing from index: docs/wiki/{rel}")


def check_log_bootstrap(warnings: list[str]) -> None:
    if not LOG_FILE.exists():
        return
    text = LOG_FILE.read_text(encoding="utf-8")
    if "wiki | bootstrap" not in text:
        warnings.append("Wiki log does not contain a bootstrap entry.")
    if "holonomic brain" not in text.lower():
        warnings.append("Wiki log does not contain a Holonomic Brain entry.")


def check_page_shape(warnings: list[str]) -> None:
    for page in iter_wiki_pages():
        text = page.read_text(encoding="utf-8")
        title = page_title(page)
        if "Updated:" not in text and page.parts[-2] == "strategy":
            warnings.append(
                f"Strategy page should declare update metadata: {page.relative_to(ROOT)}"
            )
        if page.parts[-2] == "incidents":
            required = ["## Symptom", "## Impact", "## Root Cause", "## Fix"]
            missing = [header for header in required if header not in text]
            if missing:
                warnings.append(
                    f"Incident page missing sections {missing}: {page.relative_to(ROOT)}"
                )
        if len(title.split()) < 2:
            warnings.append(f"Page title is too terse: {page.relative_to(ROOT)}")


def main() -> int:
    errors: list[str] = []
    warnings: list[str] = []

    check_required_files(errors)
    check_relative_links(errors)
    check_index_coverage(errors)
    check_log_bootstrap(warnings)
    check_page_shape(warnings)

    print("Wiki lint report")
    print(f"Root: {ROOT}")
    print(f"Errors: {len(errors)}")
    print(f"Warnings: {len(warnings)}")

    if errors:
        print("\nErrors")
        for error in errors:
            print(f"- {error}")

    if warnings:
        print("\nWarnings")
        for warning in warnings:
            print(f"- {warning}")

    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
