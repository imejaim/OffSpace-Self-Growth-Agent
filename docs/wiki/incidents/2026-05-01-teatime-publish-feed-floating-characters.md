# 2026-05-01 - Teatime Publish, Feed, and Floating Characters

## Summary

The operator reported that local `http://127.0.0.1:3000` still behaved as if publishing did not work, and that Ko/Oh/Jem were far apart near the side feed card instead of gathering beside the main news article.

## Why It Happened

- A stale Next dev server was still bound to port 3000, so browser behavior did not match the latest source until the process was restarted.
- `TeatimeView.handlePublish()` only saved publish data to `localStorage` and navigated. It did not call `/api/teatime/publish`, so production/public service state was not guaranteed.
- `/api/teatime/publish` missed required `intercepts` schema fields: `teatime_id`, `topic_id`, `message_id`, `character_id`, and `is_public`.
- `/api/feed` used an inner join to `profiles`, which hides anonymous public rows.
- `FeedView` was still a Coming Soon placeholder, so even successful publish had no meaningful public feed surface.
- `FloatingCharacters` rendered inside a transformed carousel card. CSS transforms can become the containing block for fixed-position descendants, so `position: fixed` behaved relative to the transformed card instead of the viewport and characters drifted off-screen.

## What Changed

- `intercept/src/components/views/TeatimeView.tsx`
  - `handlePublish()` now calls `/api/teatime/publish` before local fallback and feed navigation.
  - UI stops and shows an error if server publish fails.
- `intercept/src/app/api/teatime/publish/route.ts`
  - Writes schema-compatible rows for teatime publishes.
  - Sets `teatime_id`, `topic_id`, `message_id`, `character_id`, `is_public`, `visibility`, and `nickname`.
- `intercept/src/app/api/feed/route.ts`
  - Selects `nickname` directly from `intercepts`.
  - Avoids `profiles!inner`, so anonymous public rows can appear.
- `intercept/src/components/views/FeedView.tsx`
  - Replaced Coming Soon placeholder with public intercept cards.
  - Keeps local fallback and a 6-second request timeout for slow Supabase wakeups.
- `intercept/src/components/FloatingCharacters.tsx`
  - Uses `createPortal(..., document.body)` for the floating overlay.
  - Targets `.carousel-card--center .teatime-main` as the reading column.
  - Initializes characters just outside the article edges so they read along with the news.

## Verification

- Restarted the stale port-3000 dev process and served current source.
- `npm run build` passed.
- Targeted ESLint on changed source returned 0 errors, with only pre-existing `<img>` optimization warnings.
- Headless Chrome verification clicked publish, observed `/api/teatime/publish` `200 OK`, confirmed navigation to `/feed`, confirmed feed cards rendered, and confirmed character coordinates adjacent to article bounds.

## Future Reminder

If the browser does not match source changes, first check whether an old Next dev server is still bound to port 3000. Restart it before debugging app logic.
