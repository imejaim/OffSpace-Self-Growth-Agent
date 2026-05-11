# Option B — Follow-up Work Items (2026-05-11)

**Created**: 2026-05-11  
**Owner**: 대표님 / next available executor agent  
**Context**: Consolidated after 2026-05-06 publish failure and 2026-05-10 hallucination incident  
**Related incidents**: [2026-05-06 stderr trap](../incidents/2026-05-06-teatime-publish-stderr-trap.md) · [2026-05-10 hallucination](../incidents/2026-05-10-intercept-hallucination-llama2.md)

These items are not yet implemented. Each is safe to tackle independently. Priority column reflects the manager's assessment at time of writing.

---

## Checklist

### B-1 — collect-news: robotics topic source expansion

- [ ] Add dedicated robotics RSS/API sources to `collect-news` step
- **Size**: M
- **Priority**: High
- **Expected effect**: Topic 4 (AI Robots / Physical AI) consistently produces fewer than 3 reference links, triggering the `[WARN]` threshold every run. Adding structured sources resolves the structural gap.
- **Candidate sources**: The Robot Report, IEEE Spectrum Robotics, r/robotics, HuggingFace Papers robotics tag. (r/LocalLLaMA is already included for topic 3 — robotics needs its own feed.)
- **Related code/files**: `scripts/teatime-collect-news.py` (or equivalent collector), `scripts/teatime-daily-publish.ps1`
- **Related memory**: `feedback_teatime_publishing_rules.md` (source minimum 12+)

---

### B-2 — fetch-images: og failure fallback chain

- [ ] Add multi-stage fallback when `og:image` extraction fails
- **Size**: M
- **Priority**: Medium
- **Expected effect**: `openai.com` and `google.com` domains block og scraping frequently, producing 0 images from those articles. A fallback chain reduces "0 images" runs.
- **Fallback stages**:
  1. Try a second URL from the same topic's references (different domain)
  2. Use a domain-specific representative image (e.g. `openai.com/apple-touch-icon.png` or equivalent official asset)
  3. Use a category-level placeholder as last resort (must still satisfy "2+ images" rule overall)
- **Related code/files**: `scripts/teatime-fetch-images.py`
- **Related memory**: `feedback_teatime_publishing_rules.md` (image minimum 2+)

---

### B-3 — daily-publish.ps1: `-StartFrom <step>` flag

- [ ] Add step-skip mechanism so a failed run can resume mid-pipeline
- **Size**: S
- **Priority**: Medium
- **Expected effect**: Currently, any failure forces a full re-run from step 1. Adding `-StartFrom skeleton|fetch-images|validate-links|md-to-archive` reduces re-run cost after partial failures.
- **Related code/files**: `scripts/teatime-daily-publish.ps1`
- **Related memory**: `project_teatime_publishing_v1.md` (5-step pipeline)

---

### B-4 — wrangler deploy: try/finally env-restore guard

- [ ] Wrap the deploy + monitor block in `try { ... } finally { Restore-Env }` 
- **Size**: S
- **Priority**: High
- **Expected effect**: `env-restore` was skipped twice when the deploy monitor exited abnormally. A `try/finally` block guarantees `.env.local` is restored regardless of exit path.
- **Pattern**:
  ```powershell
  try {
      # wrangler deploy + monitor loop
  } finally {
      Restore-EnvLocal   # restores .env.local from .env.local.bak.*
  }
  ```
- **Related code/files**: `scripts/teatime-daily-publish.ps1`, deploy phase section
- **Related memory**: `feedback_cloudflare_workers_deploy.md` (5-step checklist)

---

### B-5 — Windows Task Scheduler: registration verification + health alert

- [ ] Verify `TeatimeDailyPublish` task is actually registered and fires at 06:30 KST
- [ ] Add Telegram alert when N consecutive runs are missed
- **Size**: S
- **Priority**: Medium
- **Expected effect**: `schtasks /Query /TN TeatimeDailyPublish` currently returns exit 1, meaning the cron may not be registered. Verification + re-registration ensures automated publishing actually runs.
- **Check command**: `schtasks /Query /TN TeatimeDailyPublish /FO LIST`
- **Health alert**: if last successful run timestamp is more than 25 hours ago, send Telegram message to manager
- **Related code/files**: `scripts/install-teatime-scheduler.ps1`
- **Related memory**: `project_teatime_publishing_v1.md`

---

### B-6 — Pack B: Gemini Google Search grounding

- [ ] Enable `tools:[{googleSearch:{}}]` in the intercept Gemini fallback path
- **Size**: M
- **Priority**: High
- **Expected effect**: When a user asks a question outside the teatime archive's references, the model can query Google Search in real time instead of hallucinating or refusing. Directly addresses the root cause of the 2026-05-10 incident for future questions.
- **Cost**: +$0.035 per grounded call (Gemini pricing at time of writing). Recommend activating after user behaviour data accumulates to establish ROI baseline.
- **Related code/files**: `intercept/src/app/api/intercept/route.ts` (Gemini REST call section)
- **Related memory**: `project_gemini_setup.md`
- **Cross-link**: [Intercept Grounding Architecture — Future Extension Points](./intercept-grounding-architecture.md)

---

### B-7 — system prompt: hard character channel enforcement

- [ ] Strengthen A3 channel assignment from advisory guideline to hard constraint
- **Size**: S
- **Priority**: Medium
- **Expected effect**: Pack A A3 is a prompt guideline. Regression testing captured 코부장 citing a Reddit URL (젬대리's exclusive channel). A hard constraint formulation ("코부장은 Reddit URL을 절대 인용하지 않는다 — 위반 시 해당 turn을 젬대리가 대신 처리한다") should eliminate cross-channel leakage.
- **Related code/files**: `intercept/src/app/api/intercept/route.ts` system prompt section
- **Related memory**: `feedback_intercept_response_style.md`, `feedback_teatime_publishing_rules.md`
- **Cross-link**: [Intercept Grounding Architecture — Channel Assignment](./intercept-grounding-architecture.md)

---

### B-8 — .gitignore: deploy artifact patterns

- [ ] Add `.deploy-*.log` and `*.deploy.log` patterns to root `.gitignore`
- **Size**: S
- **Priority**: Low
- **Expected effect**: `intercept/.deploy-packa.log` and similar wrangler deploy log files appear as untracked files after each deploy run. Ignoring them keeps `git status` clean.
- **Related code/files**: `.gitignore`
- **Note**: This item was handled in the same session (commit 3 — chore/gitignore). Marked here for completeness; no further action needed.

---

## Summary Table

| # | Item | Size | Priority | Status |
|---|------|------|----------|--------|
| B-1 | collect-news robotics sources | M | High | Open |
| B-2 | fetch-images og fallback | M | Medium | Open |
| B-3 | daily-publish -StartFrom flag | S | Medium | Open |
| B-4 | wrangler deploy try/finally | S | High | Open |
| B-5 | Task Scheduler verification + alert | S | Medium | Open |
| B-6 | Gemini Google Search grounding | M | High | Open |
| B-7 | Hard channel enforcement A3 | S | Medium | Open |
| B-8 | .gitignore deploy artifacts | S | Low | Done (this session) |
