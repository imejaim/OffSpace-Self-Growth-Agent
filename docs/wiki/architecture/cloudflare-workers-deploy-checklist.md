# Cloudflare Workers Deploy Checklist

Updated: 2026-05-01
Status: stable

## 배경

`npm run deploy` = `opennextjs-cloudflare build && deploy`

이 명령은 내부에서 next build를 자체 호출한다. 환경이 정리되지 않으면 HMR, Fast Refresh, next-devtools 등 dev artifacts가 production bundle에 포함된다.

2026-05-01 ULW 작업 중 이 사고가 실제 발생했다. Playwright 캐시 오염과 겹쳐 판단이 늦어졌다.

## 배포 전 필수 체크리스트

```
[ ] 1. PM2 intercept stop
        pm2 stop intercept (또는 pm2 stop all)

[ ] 2. Next dev server kill
        port 3000 점유 프로세스 종료
        (PowerShell) Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process

[ ] 3. leftover 프로세스 kill
        esbuild + workerd 잔여 프로세스 종료
        (PowerShell) Get-Process esbuild,workerd -ErrorAction SilentlyContinue | Stop-Process

[ ] 4. 빌드 캐시 완전 삭제
        rm -rf intercept/.next intercept/.open-next

[ ] 5. 환경 변수 임시 변경 (.env.local)
        NEXT_PUBLIC_BASE_URL=https://interceptnews.app  (배포 후 localhost:3000으로 복구)
        SITE_URL=https://interceptnews.app
        (PowerShell) $env:NODE_ENV='production'
```

## 배포 명령

```bash
cd intercept
npm run deploy
```

## 배포 후 복구

```bash
# .env.local NEXT_PUBLIC_BASE_URL, SITE_URL → http://localhost:3000 복구
# pm2 start intercept (필요 시)
```

## Production 검증 — 최종 권위는 curl

```bash
# dev artifacts 누설 여부 확인
curl -s https://interceptnews.app | grep -E "webpack-hmr|react-refresh|next-devtools"
# 결과 없으면 clean production build
```

Playwright 검증 결과가 의심되면 항상 curl로 재확인. Playwright는 세션 캐시를 들고 있어 오염될 수 있다.

## Quota 관리

- 1회 deploy = Cloudflare Workers daily quota 1 hit
- localhost:3000에서 충분히 검증한 후에만 deploy 실행 (Local-First 원칙)
- 불필요한 재배포 최소화

## Related Pages

- [Local-First Development Workflow](./local-first-development.md)
- [Teatime Publishing Pipeline](./teatime-publishing-pipeline.md)
