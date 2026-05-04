# =============================================================================
#  install-teatime-scheduler.ps1 — Windows Task Scheduler 등록 도우미
# =============================================================================
#
#  TeatimeDailyPublish 작업을 매일 KST 06:30 에 실행하도록 등록한다.
#  관리자 권한으로 실행 권장 (Wake the computer to run / 로그인 안 되어 있어도 실행).
#
#  사용 예:
#    powershell -ExecutionPolicy Bypass -File scripts/install-teatime-scheduler.ps1
#    powershell -ExecutionPolicy Bypass -File scripts/install-teatime-scheduler.ps1 -Reinstall
#    powershell -ExecutionPolicy Bypass -File scripts/install-teatime-scheduler.ps1 -Uninstall
#
#  파라미터:
#    -Reinstall   기존 task 가 있으면 제거 후 재등록
#    -Uninstall   task 제거만 수행
#
#  제거 (수동):
#    Unregister-ScheduledTask -TaskName "TeatimeDailyPublish" -Confirm:$false
#
#  cf. docs/wiki/architecture/teatime-publishing-pipeline.md
# =============================================================================

[CmdletBinding()]
param(
    [switch]$Reinstall,
    [switch]$Uninstall
)

$ErrorActionPreference = "Stop"

$TaskName = "TeatimeDailyPublish"

# 프로젝트 루트
$ScriptDir   = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$MainScript  = Join-Path $ProjectRoot "scripts\teatime-daily-publish.ps1"

if (-not (Test-Path $MainScript)) {
    Write-Host "[FATAL] 메인 스크립트 미발견: $MainScript" -ForegroundColor Red
    exit 1
}

# 관리자 권한 확인 (필수는 아니지만 권장)
$currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
$principal   = New-Object Security.Principal.WindowsPrincipal($currentUser)
$isAdmin     = $principal.IsInRole([Security.Principal.WindowsBuiltinRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "[WARN] 관리자 권한이 아닙니다. wake/일부 옵션이 적용 안 될 수 있습니다." -ForegroundColor Yellow
    Write-Host "       PowerShell 을 '관리자 권한으로 실행' 후 재시도 권장." -ForegroundColor Yellow
}

# ---------- Uninstall / Reinstall ------------------------------------------
$existing = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($existing) {
    if ($Uninstall -or $Reinstall) {
        Write-Host "[INFO] 기존 task '$TaskName' 제거 중..."
        Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
        Write-Host "[OK] 기존 task 제거 완료"
        if ($Uninstall) {
            Write-Host "[DONE] uninstall 완료. 종료합니다." -ForegroundColor Green
            exit 0
        }
    } else {
        Write-Host "[INFO] task '$TaskName' 가 이미 존재합니다. 재등록하려면 -Reinstall 옵션을 사용하세요." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "현재 task 상태:" -ForegroundColor Cyan
        Get-ScheduledTask -TaskName $TaskName | Format-List TaskName, State, Description
        Get-ScheduledTaskInfo -TaskName $TaskName | Format-List LastRunTime, LastTaskResult, NextRunTime
        exit 0
    }
}

if ($Uninstall) {
    Write-Host "[INFO] 등록된 task '$TaskName' 가 없습니다. 종료." -ForegroundColor Yellow
    exit 0
}

# ---------- 등록 -----------------------------------------------------------
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host " TeatimeDailyPublish — Windows Task Scheduler 등록"
Write-Host " 트리거: 매일 KST 06:30"
Write-Host " 스크립트: $MainScript"
Write-Host " 작업 디렉토리: $ProjectRoot"
Write-Host "================================================================" -ForegroundColor Cyan

# 액션: powershell.exe 로 메인 스크립트 호출
$action = New-ScheduledTaskAction `
    -Execute "powershell.exe" `
    -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$MainScript`"" `
    -WorkingDirectory $ProjectRoot

# 트리거: 매일 06:30 (로컬 시계 기준 — 호스트가 KST 라고 가정)
# 호스트 시계가 KST 가 아닐 수 있으므로 가산 보정 안내만 출력하고 06:30 사용
$trigger = New-ScheduledTaskTrigger -Daily -At "06:30"

# 옵션: wake / 재시도 / 사용자 로그인 무관
$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -WakeToRun `
    -RestartCount 1 `
    -RestartInterval (New-TimeSpan -Minutes 10) `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 30) `
    -MultipleInstances IgnoreNew

# Principal: 현재 사용자 / 로그인 안 되어 있어도 실행 (S4U)
$userId = "$env:USERDOMAIN\$env:USERNAME"
$principalObj = New-ScheduledTaskPrincipal `
    -UserId $userId `
    -LogonType S4U `
    -RunLevel Highest

$task = New-ScheduledTask `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings `
    -Principal $principalObj `
    -Description "Offspace 티타임 정기발행 (매일 KST 06:30). 메인 스크립트: scripts/teatime-daily-publish.ps1. 텔레그램 알림 포함."

try {
    Register-ScheduledTask -TaskName $TaskName -InputObject $task | Out-Null
    Write-Host "[OK] task 등록 완료" -ForegroundColor Green
} catch {
    Write-Host "[FATAL] task 등록 실패: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "        관리자 권한이 필요할 수 있습니다." -ForegroundColor Yellow
    exit 1
}

# ---------- 결과 출력 ------------------------------------------------------
Write-Host ""
Write-Host "================ 등록 결과 ================" -ForegroundColor Cyan
Get-ScheduledTask -TaskName $TaskName | Format-List TaskName, State, Description
Get-ScheduledTaskInfo -TaskName $TaskName | Format-List LastRunTime, LastTaskResult, NextRunTime

Write-Host ""
Write-Host "수동 테스트:" -ForegroundColor Cyan
Write-Host "  Start-ScheduledTask -TaskName $TaskName" -ForegroundColor White
Write-Host ""
Write-Host "제거:" -ForegroundColor Cyan
Write-Host "  Unregister-ScheduledTask -TaskName $TaskName -Confirm:`$false" -ForegroundColor White
Write-Host "  또는: powershell -ExecutionPolicy Bypass -File scripts/install-teatime-scheduler.ps1 -Uninstall" -ForegroundColor White
Write-Host ""
Write-Host "주의:" -ForegroundColor Yellow
Write-Host "  - intercept/.env.local 에 TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID 가 있어야 텔레그램 알림이 갑니다."
Write-Host "  - 호스트 OS 의 시계 시간대가 KST(서울) 이어야 06:30 트리거가 KST 06:30 과 일치합니다."
Write-Host "  - 호스트가 다른 시간대면 New-ScheduledTaskTrigger -At 의 시간을 그에 맞게 조정하세요."
