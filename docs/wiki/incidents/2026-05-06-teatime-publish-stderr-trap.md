# Incident: Teatime Publish stderr Trap (2026-05-06)

**Date**: 2026-05-06  
**Severity**: High — automated daily publish silently aborted at 06:30 KST  
**Status**: Patched (validate-links.py stdout fix applied)  
**Related**: [Option B Follow-ups](../architecture/option-b-followups-2026-05-11.md)

---

## Summary

Two related failures occurred in the same publish cycle:

1. **Primary**: `teatime-validate-links.py` emitted `[WARN]` messages to stderr. PowerShell 5.1's `Invoke-Native` wraps native-process stderr as `ErrorRecord` objects when `2>&1` is used. With `$ErrorActionPreference = "Stop"` active in `daily-publish.ps1`, any ErrorRecord causes an immediate throw — aborting the pipeline even though the Python process exited 0.

2. **Secondary**: The deploy step's `env-restore` phase was not guarded in a `try/finally` block. When the deploy monitor loop exited abnormally, `.env.local` was not restored, leaving the environment in a broken state until manually recovered by the manager.

Both failures went undetected until the manager diagnosed them during recovery.

---

## Timeline

| Time (KST) | Event |
|-----------|-------|
| 2026-05-05 21:26 | Manual publish trigger. `validate-links` step aborts. Pipeline stops. |
| ~2026-05-05 24:00 | Manager diagnoses stderr-as-ErrorRecord pattern. Root cause confirmed. |
| 2026-05-06 (am) | First deploy attempt. `env-restore` not reached — environment left broken. |
| 2026-05-06 (am) | Manager manually restores `.env.local`. Second deploy succeeds. |
| 2026-05-06 (session) | `validate-links.py` patched: `[WARN]` moved from stderr to stdout. |

---

## Root Cause

### Direct cause — stderr ErrorRecord wrap

`daily-publish.ps1` calls Python scripts via a helper (`Invoke-Native` or equivalent) that redirects stderr with `2>&1`. In PowerShell 5.1, this causes each native-process stderr line to be wrapped as an `ErrorRecord`. When `$ErrorActionPreference = "Stop"` is set, the first ErrorRecord throws immediately, halting the pipeline.

`validate-links.py` used `sys.stderr.write()` for `[WARN]` messages (link count below threshold). These warnings are non-fatal by design — the script exits 0 — but the ErrorRecord wrap made them fatal in the pipeline context.

### Contributing cause 1 — robotics topic chronically under-sourced

The `collect-news` step has no dedicated sources for topic 4 (AI Robots / Physical AI). The topic consistently produces fewer than 3 reference links, triggering the `[WARN]` threshold check every run. Even after the stderr fix, the structural gap remains. See [Option B #1](../architecture/option-b-followups-2026-05-11.md).

### Contributing cause 2 — fetch-images og fallback absent

`fetch-images` has no fallback when `og:image` extraction fails. Domains such as `openai.com` and `google.com` frequently block og scraping, resulting in 0 images collected from those articles. See [Option B #2](../architecture/option-b-followups-2026-05-11.md).

### Contributing cause 3 — env-restore not in try/finally

The `env-restore` step (which restores `.env.local` after deploy) was sequenced as a linear step after the deploy monitor loop. If the loop exited abnormally — due to timeout, error, or manual interrupt — the restore was skipped. There was no `try/finally` guard to ensure cleanup. See [Option B #4](../architecture/option-b-followups-2026-05-11.md).

---

## Applied Patches

### Patch A — validate-links.py: WARN to stdout

File: `scripts/teatime-validate-links.py`

The `[WARN]` output lines for under-threshold link counts were moved from `sys.stderr` to `sys.stdout`. A code comment was added explaining the PowerShell 5.1 `2>&1` / ErrorRecord constraint so future maintainers do not revert this change.

```python
# NOTE: stdout 으로 출력해야 함. PowerShell 5.1 의 Invoke-Native 가
# 2>&1 로 stderr 를 ErrorRecord 로 wrap 하기 때문에, 단순 경고도
# ErrorActionPreference=Stop 환경에서 throw 로 변환되어 발행이 abort 됨.
print(f"[WARN] 토픽 {short_topics} 가 3개 미만 — 룰북 위반 위험")
```

### Patch B — settings.local.json allowlist

File: `.claude/settings.local.json`

Publishing-related PowerShell and Bash patterns (`python *`, `powershell *`, `git *`, `schtasks *`) and the `Agent` delegation pattern were added to the `permissions.allow` list so the manager can trigger publish pipelines without per-command approval prompts.

---

## Remaining Prevention TODOs

These are tracked as Option B items; not yet implemented:

| # | Item | Doc |
|---|------|-----|
| B-1 | Add robotics sources to collect-news | [option-b-followups](../architecture/option-b-followups-2026-05-11.md) |
| B-2 | og fallback for fetch-images | [option-b-followups](../architecture/option-b-followups-2026-05-11.md) |
| B-3 | `-StartFrom <step>` flag for daily-publish.ps1 | [option-b-followups](../architecture/option-b-followups-2026-05-11.md) |
| B-4 | try/finally around wrangler deploy + env-restore | [option-b-followups](../architecture/option-b-followups-2026-05-11.md) |
| B-5 | Windows Task Scheduler registration verification | [option-b-followups](../architecture/option-b-followups-2026-05-11.md) |

---

## Guardrails (Post-Incident Rules)

1. Never write `[WARN]` or any non-error diagnostic to stderr in scripts called from `daily-publish.ps1`. Use stdout.
2. Any step that mutates the environment (`.env.local`, wrangler secrets, etc.) must be wrapped in `try/finally` with restoration as the finally clause.
3. If `schtasks /Query /TN TeatimeDailyPublish` returns non-zero, treat the cron as unregistered and re-register before relying on it.

---

## Verification

- `validate-links.py` executed after patch: `[WARN]` lines appear on stdout, pipeline continues to next step, exit code 0.
- Pipeline ran to completion without abort on the next manual trigger after patching.
