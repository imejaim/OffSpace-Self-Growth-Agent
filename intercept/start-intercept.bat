@echo off
:: INTERCEPT 자동 시작 스크립트
:: Windows 작업 스케줄러에서 "로그온 시 실행"으로 등록

cd /d C:\Project\18_OffSpace_Self_Growth_Agent\intercept
call pm2 resurrect
timeout /t 10 /nobreak >/dev/null

:: 헬스체크 — 서버 응답 확인
curl -s -o nul -w "%%{http_code}" http://localhost:4000 | findstr "200" >/dev/null
if errorlevel 1 (
    echo [%date% %time%] INTERCEPT health check failed, restarting... >> logs\health.log
    call pm2 restart intercept
) else (
    echo [%date% %time%] INTERCEPT started successfully >> logs\health.log
)
