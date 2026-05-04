# =============================================================================
#  Teatime Daily Publish — 로컬 정기발행 PowerShell 스크립트
# =============================================================================
#
#  Windows Task Scheduler 가 매일 KST 06:30 에 호출하는 스크립트.
#  GitHub Actions 대체. 단일 진실 = 로컬, secrets = .env.local 에서만 로드.
#
#  사용 예 :
#    powershell -ExecutionPolicy Bypass -File scripts/teatime-daily-publish.ps1
#    powershell -ExecutionPolicy Bypass -File scripts/teatime-daily-publish.ps1 -DryRun
#    powershell -ExecutionPolicy Bypass -File scripts/teatime-daily-publish.ps1 -Vol 14
#    powershell -ExecutionPolicy Bypass -File scripts/teatime-daily-publish.ps1 -Date 2026-05-01 -DryRun
#
#  파라미터:
#    -DryRun              deploy + git push 생략, MD 생성·검증·아카이브·텔레그램 알림까지만
#    -Vol <N>             강제 vol 번호 (선택, auto-generate.py 환경변수 TEATIME_VOL 로 전달)
#    -Date <YYYY-MM-DD>   날짜 강제 (선택, 기본 오늘 KST)
#
#  요구 환경변수 (intercept/.env.local 에 정의):
#    GEMINI_API_KEY         (필수) Gemini 2.5-flash 호출
#    NEXT_PUBLIC_SUPABASE_URL                         (선택, 아카이브 단계)
#    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY              (선택)
#    SUPABASE_ACCESS_TOKEN                              (선택)
#    TELEGRAM_BOT_TOKEN     (선택, 미등록 시 stdout 로그만)
#    TELEGRAM_CHAT_ID       (선택, 미등록 시 stdout 로그만)
#    TAVILY_API_KEY         (선택, collect-news Phase 2 보충)
#
#  cf. docs/wiki/architecture/teatime-publishing-pipeline.md
#  cf. docs/wiki/architecture/cloudflare-workers-deploy-checklist.md
# =============================================================================

[CmdletBinding()]
param(
    [switch]$DryRun,
    [int]$Vol = 0,
    [string]$Date = ""
)

# ----- 안전 모드 -------------------------------------------------------------
$ErrorActionPreference = "Stop"
$ProgressPreference    = "SilentlyContinue"   # Invoke-RestMethod 진행률 출력 억제
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# ----- 프로젝트 루트 ----------------------------------------------------------
# 스크립트 위치 = <ROOT>\scripts\teatime-daily-publish.ps1
$ScriptDir   = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
Set-Location -Path $ProjectRoot

# ----- 시작 시간 / 단계 추적 --------------------------------------------------
$Global:RunStart  = Get-Date
$Global:LastStep  = "init"
$Global:StepLog   = New-Object System.Collections.ArrayList

# =============================================================================
# 함수들
# =============================================================================

function Get-KstDate {
    param([string]$Override)
    if ($Override) { return $Override }
    # Windows 시계가 무엇이든 KST 기준으로 계산
    $utc = [DateTime]::UtcNow
    $kst = $utc.AddHours(9)
    return $kst.ToString("yyyy-MM-dd")
}

function Read-DotEnv {
    param([string]$Path)
    # 단순 줄 단위 파서. 라이브러리 의존 없음.
    if (-not (Test-Path $Path)) {
        Write-LogLine "[WARN] .env.local 미발견: $Path"
        return @{}
    }
    $env_map = @{}
    Get-Content -LiteralPath $Path -Encoding UTF8 | ForEach-Object {
        $line = $_
        if ([string]::IsNullOrWhiteSpace($line)) { return }
        $trim = $line.Trim()
        if ($trim.StartsWith("#")) { return }
        $eq = $trim.IndexOf("=")
        if ($eq -lt 1) { return }
        $key = $trim.Substring(0, $eq).Trim()
        $val = $trim.Substring($eq + 1).Trim()
        # 양쪽 따옴표 제거
        if ($val.Length -ge 2) {
            if (($val.StartsWith('"') -and $val.EndsWith('"')) -or
                ($val.StartsWith("'") -and $val.EndsWith("'"))) {
                $val = $val.Substring(1, $val.Length - 2)
            }
        }
        $env_map[$key] = $val
    }
    return $env_map
}

function Set-EnvFromMap {
    param([hashtable]$Map)
    foreach ($k in $Map.Keys) {
        # 이미 호스트 환경에 있어도 .env.local 값을 우선 적용
        Set-Item -Path "Env:$k" -Value $Map[$k]
    }
}

function Write-LogLine {
    param([string]$Message)
    $stamp = (Get-Date).ToString("HH:mm:ss")
    $line  = "[$stamp] $Message"
    Write-Host $line
    if ($Global:LogPath) {
        try { Add-Content -LiteralPath $Global:LogPath -Value $line -Encoding UTF8 } catch { }
    }
}

function Invoke-Step {
    param(
        [string]$Name,
        [scriptblock]$Action
    )
    $Global:LastStep = $Name
    $stepStart = Get-Date
    Write-LogLine "===== STEP: $Name ====="
    try {
        & $Action
        $dur = [int]((Get-Date) - $stepStart).TotalSeconds
        [void]$Global:StepLog.Add(@{ name = $Name; ok = $true; sec = $dur })
        Write-LogLine "[OK] $Name (${dur}s)"
    } catch {
        $dur = [int]((Get-Date) - $stepStart).TotalSeconds
        [void]$Global:StepLog.Add(@{ name = $Name; ok = $false; sec = $dur })
        $errMsg = $_.Exception.Message
        Write-LogLine "[FAIL] $Name (${dur}s): $errMsg"
        throw
    }
}

function Invoke-Native {
    # 외부 exe 실행 + stdout/stderr 모두 로그 파일에 동시 기록 (Tee-Object 패턴)
    param(
        [Parameter(Mandatory=$true)][string]$File,
        [Parameter(Mandatory=$true)][string[]]$Args
    )
    $argLine = ($Args | ForEach-Object { if ($_ -match '\s') { '"' + $_ + '"' } else { $_ } }) -join ' '
    Write-LogLine "$ $File $argLine"
    # & 호출 결과를 한 줄씩 받아 Tee 한다 (PowerShell 5.1 호환)
    & $File @Args 2>&1 | ForEach-Object {
        $text = $_.ToString()
        Write-Host $text
        if ($Global:LogPath) {
            try { Add-Content -LiteralPath $Global:LogPath -Value $text -Encoding UTF8 } catch { }
        }
    }
    if ($LASTEXITCODE -ne 0) {
        throw "$File exit code $LASTEXITCODE (args: $argLine)"
    }
}

function Send-TelegramAlert {
    param(
        [Parameter(Mandatory=$true)][ValidateSet("success","failure","dryrun")][string]$Mode,
        [Parameter(Mandatory=$true)][string]$Text
    )
    $token  = $env:TELEGRAM_BOT_TOKEN
    $chat   = $env:TELEGRAM_CHAT_ID
    if (-not $token -or -not $chat) {
        Write-LogLine "[INFO] TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID 미등록 — 텔레그램 전송 생략 (메시지는 로그에만 기록)"
        Write-LogLine "----- TELEGRAM($Mode) -----"
        Write-LogLine $Text
        Write-LogLine "---------------------------"
        return
    }
    if ($DryRun -and $Mode -ne "failure") {
        # DryRun 에서는 success 메시지를 실제 송신하지 않고 로그에만 남긴다.
        Write-LogLine "[DRY-RUN] 텔레그램 송신 생략 — 아래는 build 한 메시지 미리보기"
        Write-LogLine "----- TELEGRAM($Mode) -----"
        Write-LogLine $Text
        Write-LogLine "---------------------------"
        return
    }
    try {
        $url  = "https://api.telegram.org/bot$token/sendMessage"
        $body = @{
            chat_id    = $chat
            text       = $Text
            parse_mode = "Markdown"
            disable_web_page_preview = $true
        }
        $null = Invoke-RestMethod -Uri $url -Method Post -Body $body -TimeoutSec 15
        Write-LogLine "[OK] 텔레그램 알림 전송 ($Mode)"
    } catch {
        Write-LogLine "[WARN] 텔레그램 전송 실패: $($_.Exception.Message)"
    }
}

function Build-SuccessMessage {
    param([string]$DateStr, [int]$TotalSec)
    $lines = @()
    $lines += "*[Teatime] 정기발행 OK — $DateStr*"
    $lines += ""
    $lines += "총 소요: ${TotalSec}s"
    $lines += "URL: https://interceptnews.app/teatime"
    $lines += ""
    $lines += "*단계별 시간*"
    foreach ($s in $Global:StepLog) {
        $mark = if ($s.ok) { "OK" } else { "FAIL" }
        $lines += "- $mark $($s.name) ($($s.sec)s)"
    }
    if ($DryRun) {
        $lines += ""
        $lines += "_DryRun 모드 — deploy/commit/push 생략_"
    }
    return ($lines -join "`n")
}

function Build-FailureMessage {
    param([string]$DateStr, [string]$ErrText, [int]$TotalSec)
    $lines = @()
    $lines += "*[Teatime] 정기발행 실패 — $DateStr*"
    $lines += ""
    $lines += "실패 단계: ``$($Global:LastStep)``"
    $lines += "총 소요: ${TotalSec}s"
    $lines += ""
    $lines += "에러:"
    $lines += '```'
    $lines += $ErrText
    $lines += '```'
    $lines += ""
    $lines += "*긴급 인터셉트 발행이 필요하시면*"
    $lines += "Claude Code 에서 다음 명령 실행:"
    $lines += "``npm run teatime:intercept -- $DateStr``"
    $lines += "또는 코부장에게 지시해 주세요."
    $lines += ""
    $lines += "로그: ``$Global:LogPath``"
    return ($lines -join "`n")
}

# =============================================================================
# 메인
# =============================================================================

# ----- 날짜 계산 + 로그 파일 경로 ---------------------------------------------
$DateStr = Get-KstDate -Override $Date
$LogDir  = Join-Path $ProjectRoot "output\teatime\logs"
if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Force -Path $LogDir | Out-Null }
$Global:LogPath = Join-Path $LogDir "$DateStr.log"

Write-LogLine "================================================================"
Write-LogLine " Teatime Daily Publish — KST $DateStr (DryRun=$DryRun, Vol=$Vol)"
Write-LogLine " ProjectRoot: $ProjectRoot"
Write-LogLine " Log file:    $Global:LogPath"
Write-LogLine "================================================================"

# ----- .env.local 로드 (intercept/.env.local 우선) ---------------------------
$envPath = Join-Path $ProjectRoot "intercept\.env.local"
if (-not (Test-Path $envPath)) {
    # 폴백: 루트의 .env.local 도 한 번 더 시도
    $envPath = Join-Path $ProjectRoot ".env.local"
}
$envMap = Read-DotEnv -Path $envPath
Set-EnvFromMap -Map $envMap
Write-LogLine "[INFO] .env.local 로드: $envPath ($($envMap.Count) 키)"

# 필수 변수 검증
if (-not $env:GEMINI_API_KEY) {
    $msg = "GEMINI_API_KEY 누락 — .env.local 확인 필요 ($envPath)"
    Write-LogLine "[FATAL] $msg"
    Send-TelegramAlert -Mode failure -Text (Build-FailureMessage -DateStr $DateStr -ErrText $msg -TotalSec 0)
    exit 1
}

# Vol 강제 시 환경변수로 전달
if ($Vol -gt 0) {
    $env:TEATIME_VOL = "$Vol"
    Write-LogLine "[INFO] TEATIME_VOL=$Vol 강제 적용"
}

# ----- 산출물 경로 ------------------------------------------------------------
$MdFile  = Join-Path $ProjectRoot ("output\teatime\${DateStr}_AI동향_티타임.md")
$RawFile = Join-Path $ProjectRoot ("output\raw\teatime-raw-${DateStr}.json")

New-Item -ItemType Directory -Force -Path (Split-Path $MdFile)  | Out-Null
New-Item -ItemType Directory -Force -Path (Split-Path $RawFile) | Out-Null

# ----- env 백업/복구 변수 (deploy 전후) ---------------------------------------
$envBackupPath = "$envPath.bak.$([DateTime]::Now.ToString('yyyyMMddHHmmss'))"
$envBackedUp   = $false

# =============================================================================
# 단계별 실행 — try/catch 로 감싸 실패 시 텔레그램 통보
# =============================================================================
try {

    # 1. skeleton ----------------------------------------------------------------
    Invoke-Step -Name "skeleton" -Action {
        $py = "python"
        $args = @(
            "scripts/teatime-skeleton.py",
            $DateStr
        )
        Write-LogLine "$ $py $($args -join ' ') > $MdFile"
        # skeleton 은 stdout 으로 MD 출력
        & $py @args 2>&1 | Tee-Object -Variable __null | Out-File -LiteralPath $MdFile -Encoding utf8
        if ($LASTEXITCODE -ne 0) { throw "skeleton.py exit code $LASTEXITCODE" }
        if (-not (Test-Path $MdFile)) { throw "skeleton MD 미생성: $MdFile" }
        $size = (Get-Item $MdFile).Length
        Write-LogLine "[OK] skeleton MD 생성 (${size} bytes)"
    }

    # 2. collect-news -----------------------------------------------------------
    Invoke-Step -Name "collect-news" -Action {
        Invoke-Native -File "python" -Args @(
            "scripts/teatime-collect-news.py",
            "--date", $DateStr,
            "--output", $RawFile
        )
        if (-not (Test-Path $RawFile)) { throw "raw JSON 미생성: $RawFile" }
    }

    # 3. auto-generate ----------------------------------------------------------
    Invoke-Step -Name "auto-generate" -Action {
        Invoke-Native -File "python" -Args @(
            "scripts/teatime-auto-generate.py",
            $RawFile,
            "--output", $MdFile
        )
    }

    # 4. fetch-images -----------------------------------------------------------
    Invoke-Step -Name "fetch-images" -Action {
        Invoke-Native -File "python" -Args @(
            "scripts/teatime-fetch-images.py",
            $MdFile
        )
    }

    # 5. validate-links ---------------------------------------------------------
    Invoke-Step -Name "validate-links" -Action {
        Invoke-Native -File "python" -Args @(
            "scripts/teatime-validate-links.py",
            $MdFile
        )
    }

    # 6. validation gate (skeleton --validate) ---------------------------------
    Invoke-Step -Name "validate-gate" -Action {
        Invoke-Native -File "python" -Args @(
            "scripts/teatime-skeleton.py",
            "--validate",
            $MdFile
        )
    }

    # 7. md-to-archive --register ----------------------------------------------
    Invoke-Step -Name "md-to-archive" -Action {
        Invoke-Native -File "python" -Args @(
            "scripts/teatime-md-to-archive.py",
            $MdFile,
            "--register"
        )
    }

    # ---------- 여기까지가 검증 + 아카이브 등록 단계 ----------
    # DryRun 모드는 commit/deploy 단계 전체 생략

    if (-not $DryRun) {

        # 8. Cloudflare Workers deploy 사전 정리 -------------------------------
        # cf. docs/wiki/architecture/cloudflare-workers-deploy-checklist.md
        Invoke-Step -Name "predeploy-cleanup" -Action {

            # 8-1. PM2 intercept stop (있으면)
            try {
                $pm2 = Get-Command pm2 -ErrorAction SilentlyContinue
                if ($pm2) {
                    & pm2 stop intercept 2>&1 | ForEach-Object {
                        Write-LogLine "[pm2] $_"
                    }
                } else {
                    Write-LogLine "[INFO] pm2 미설치 — skip"
                }
            } catch { Write-LogLine "[WARN] pm2 stop 실패 (무시): $($_.Exception.Message)" }

            # 8-2. esbuild / workerd / 잔재 node 프로세스 kill (dev server 살리기 위해 node 는 신중)
            foreach ($pname in @("esbuild","workerd")) {
                try {
                    $procs = Get-Process -Name $pname -ErrorAction SilentlyContinue
                    if ($procs) {
                        $procs | ForEach-Object {
                            Write-LogLine "[KILL] $pname PID=$($_.Id)"
                            try { Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue } catch { }
                        }
                    }
                } catch { }
            }

            # 8-3. .next / .open-next 빌드 캐시 삭제
            $nextDir     = Join-Path $ProjectRoot "intercept\.next"
            $openNextDir = Join-Path $ProjectRoot "intercept\.open-next"
            foreach ($d in @($nextDir, $openNextDir)) {
                if (Test-Path $d) {
                    Write-LogLine "[CLEAN] rm -rf $d"
                    try { Remove-Item -LiteralPath $d -Recurse -Force -ErrorAction Stop } catch {
                        Write-LogLine "[WARN] $d 삭제 실패: $($_.Exception.Message)"
                    }
                }
            }

            # 8-4. .env.local 임시 production 값으로 변경 (백업 후)
            #      NEXT_PUBLIC_BASE_URL / NEXT_PUBLIC_SITE_URL → https://interceptnews.app
            if (Test-Path $envPath) {
                Copy-Item -LiteralPath $envPath -Destination $envBackupPath -Force
                $envBackedUp = $true
                Write-LogLine "[BACKUP] $envPath → $envBackupPath"
                $content = Get-Content -LiteralPath $envPath -Raw -Encoding UTF8
                $content = [regex]::Replace($content,
                    'NEXT_PUBLIC_BASE_URL\s*=\s*"[^"]*"',
                    'NEXT_PUBLIC_BASE_URL="https://interceptnews.app"')
                $content = [regex]::Replace($content,
                    'NEXT_PUBLIC_SITE_URL\s*=\s*"[^"]*"',
                    'NEXT_PUBLIC_SITE_URL="https://interceptnews.app"')
                Set-Content -LiteralPath $envPath -Value $content -Encoding UTF8 -NoNewline
                Write-LogLine "[ENV] BASE_URL/SITE_URL → production 값 임시 적용"
            }
        }

        # 9. git commit + push -------------------------------------------------
        Invoke-Step -Name "git-commit-push" -Action {
            # 신규/수정 산출물만 add
            Invoke-Native -File "git" -Args @(
                "add",
                "output/teatime/",
                "output/raw/",
                "intercept/src/lib/teatime-archive/",
                "intercept/src/lib/teatime-data.ts",
                "intercept/public/teatime-images/"
            )
            # 변경 사항 없으면 skip
            $diff = & git diff --cached --quiet
            $hasChanges = $LASTEXITCODE -ne 0
            if (-not $hasChanges) {
                Write-LogLine "[INFO] staged 변경 없음 — commit/push skip"
                return
            }
            $commitMsg = @"
feat(teatime): $DateStr 자동 발행 (local scheduler)

- skeleton + collect-news + Gemini 2.5-flash 합성
- 이미지 로컬화 / 링크 검증 / 룰북 검증 통과
- MD->TS archive 등록
- Trigger: Windows Task Scheduler (TeatimeDailyPublish)
"@
            $tmpFile = New-TemporaryFile
            Set-Content -LiteralPath $tmpFile -Value $commitMsg -Encoding UTF8
            try {
                Invoke-Native -File "git" -Args @("commit","-F",$tmpFile.FullName)
            } finally {
                Remove-Item -LiteralPath $tmpFile -Force -ErrorAction SilentlyContinue
            }
            # 현재 브랜치로 push
            $branch = (& git rev-parse --abbrev-ref HEAD).Trim()
            Invoke-Native -File "git" -Args @("push","origin",$branch)
        }

        # 10. wrangler deploy ---------------------------------------------------
        Invoke-Step -Name "deploy" -Action {
            $interceptDir = Join-Path $ProjectRoot "intercept"
            Push-Location $interceptDir
            try {
                $env:NODE_ENV = "production"
                Invoke-Native -File "npm" -Args @("run","deploy")
            } finally {
                Pop-Location
            }
        }
    } else {
        Write-LogLine "[DRY-RUN] predeploy-cleanup / git-commit-push / deploy 건너뜀"
    }

    # 11. .env.local 복구 ------------------------------------------------------
    if ($envBackedUp -and (Test-Path $envBackupPath)) {
        Invoke-Step -Name "env-restore" -Action {
            Copy-Item -LiteralPath $envBackupPath -Destination $envPath -Force
            Remove-Item -LiteralPath $envBackupPath -Force -ErrorAction SilentlyContinue
            Write-LogLine "[OK] .env.local 복구 완료"
        }
    }

    # 12. 성공 알림 -----------------------------------------------------------
    $totalSec = [int]((Get-Date) - $Global:RunStart).TotalSeconds
    $successText = Build-SuccessMessage -DateStr $DateStr -TotalSec $totalSec
    $alertMode = "success"
    if ($DryRun) { $alertMode = "dryrun" }
    Send-TelegramAlert -Mode $alertMode -Text $successText
    Write-LogLine "================================================================"
    Write-LogLine " 정기발행 성공 — 총 ${totalSec}s"
    Write-LogLine "================================================================"
    exit 0

} catch {
    $errText = $_.Exception.Message
    $totalSec = [int]((Get-Date) - $Global:RunStart).TotalSeconds
    Write-LogLine "[FATAL] 단계 [$Global:LastStep] 에서 abort: $errText"

    # .env.local 복구 시도 (deploy 전후 백업이 살아 있다면)
    if ($envBackedUp -and (Test-Path $envBackupPath)) {
        try {
            Copy-Item -LiteralPath $envBackupPath -Destination $envPath -Force
            Remove-Item -LiteralPath $envBackupPath -Force -ErrorAction SilentlyContinue
            Write-LogLine "[OK] 실패 직후 .env.local 복구 완료"
        } catch {
            Write-LogLine "[WARN] .env.local 복구 실패: $($_.Exception.Message)"
        }
    }

    $failText = Build-FailureMessage -DateStr $DateStr -ErrText $errText -TotalSec $totalSec
    Send-TelegramAlert -Mode failure -Text $failText
    Write-LogLine "================================================================"
    Write-LogLine " 정기발행 실패 — exit 1"
    Write-LogLine "================================================================"
    exit 1
}
