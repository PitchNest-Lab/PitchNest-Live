# PitchNest — Feature Map for Mobile

How each **current web feature** should change for iOS/Android. Companion to [MOBILE_STORE_PLAN.md](./MOBILE_STORE_PLAN.md).

**Legend:** ✅ Keep (adapt UI) · 🔄 Rework · ⏸️ Defer v1 · ❌ Not on mobile v1

---

## App structure today

| Area | Web routes | Backend |
|------|------------|---------|
| Marketing | `/` | `POST /api/waitlist` |
| Auth | `/login`, `/signup`, `/forgot-password`, `/reset-password` | `/api/auth/*` |
| Onboarding | `/onboarding` | `POST /api/profile` |
| Main shell | Sidebar: dashboard, setup, archive, analytics, decks, replay, settings | — |
| Live pitch | `/room` (full screen) | WebSocket → Gemini proxy |
| Reports | `/report`, `/replay` | `GET/DELETE /api/sessions` |
| Decks | `/decks` | `/api/decks`, `POST /api/upload-deck` |
| Session video | — | `POST /api/upload-video` |

**Mobile navigation:** replace sidebar with **bottom tabs** (Home, Pitch, Decks, History, Profile) + stack screens for setup → room → report.

---

## 1. Marketing & public

### Landing page (`/`)
| | |
|---|---|
| **Today** | Hero, features, waitlist email |
| **Mobile** | ⏸️ **Skip in native v1** — use App Store listing instead. Optional: simple “Learn more” web view. |
| **API** | Waitlist not needed if users sign up in-app |

### Privacy / Terms (footer links)
| | |
|---|---|
| **Today** | Routes live: `/privacy`, `/terms`, `/delete-account`, `/support` |
| **Mobile** | Same URLs in-app (Settings → Account) + native screens when built |

---

## 2. Authentication

### Sign up / Log in / Forgot / Reset password
| | |
|---|---|
| **Today** | JWT in `localStorage`, `AuthContext`, `authFetch` |
| **Mobile** | ✅ Keep flows; store token in **expo-secure-store** (not AsyncStorage alone) |
| **API** | Same: `POST /api/auth/signup`, `login`, `forgot-password`, `reset-password`, `GET /api/auth/me` |
| **UX** | Email keyboard, biometric unlock (v1.1), deep link for reset password (`pitchnest://reset?token=`) |
| **Store** | Demo account for reviewers |

**Gap:** No **delete account** API — add for both web and mobile.

---

## 3. Onboarding (`/onboarding`)

| | |
|---|---|
| **Today** | 3 steps: startup name, industry, goal → `POST /api/profile` → dashboard |
| **Mobile** | ✅ Same flow; full-screen wizard after first login |
| **UX** | Larger tap targets; skip button kept; progress dots |
| **Storage** | Replace `localStorage` flags with secure/local app storage |

---

## 4. Dashboard (`/dashboard`)

| | |
|---|---|
| **Today** | Recent sessions, scores, insights, CTA to start pitch |
| **Mobile** | ✅ **Home tab** — simplify layout (single column cards) |
| **API** | `GET /api/sessions` — no change |
| **Defer** | Wide multi-column “recent pitch” rows → compact cards |

---

## 5. Pre-pitch setup (`/setup`) — **high impact**

| | |
|---|---|
| **Today** | Mode (panel / coach / solo), startup fields, aggressiveness sliders, deck picker, camera/mic/**screen** toggles → navigate to `/room` |
| **Mobile** | 🔄 **Core pre-flight screen** before every pitch |

| Control | Web | Mobile v1 |
|---------|-----|-----------|
| AI mode (panel/coach/solo) | ✅ | ✅ Same |
| Business name, description, industry, archetype | ✅ | ✅ Same (shorter form on small screens) |
| Aggressiveness / risk sliders | ✅ | ✅ Vertical sliders |
| Deck selection | List from API | ✅ Same + link to upload |
| **Camera** | `getUserMedia` | ✅ `expo-camera` — optional, default **on** |
| **Microphone** | Required for live pitch | ✅ Required; permission before room |
| **Screen share** | `getDisplayMedia` — hidden if unsupported | ❌ **Remove toggle** — not available on iOS |
| **Deck vision for AI** | Screen frames sent over WS | 🔄 Send **PDF page images** (current slide) instead |

**Config passing:** web uses `sessionStorage` + `location.state` → mobile use **React Context** or navigation params.

---

## 6. Live pitch room (`/room`) — **largest rework**

| | |
|---|---|
| **Today** | ~1,100-line screen: WebSocket, Gemini audio, camera, screen capture frames, chat, panelist UI, timer, session recording, end → evaluate + video upload |
| **Mobile** | 🔄 Dedicated **full-screen** route; portrait-first; minimal chrome |

### Sub-features

| Feature | Web implementation | Mobile adjustment |
|---------|-------------------|-------------------|
| **AI connection** | `SocketContext` → `wss://` backend → Gemini | ✅ Same WS URL from **env config** (`EXPO_PUBLIC_API_URL`), not `window.location` |
| **Live audio in** | `useLiveAudio` + `AudioContext` + PCM 16kHz | 🔄 Native audio stream or recorded chunks to WS — test latency on cellular |
| **Live audio out** | Gemini audio via WS + optional `speechSynthesis` | ✅ Play PCM/audio chunks with **expo-av**; drop browser TTS |
| **Camera preview** | `useMediaRecorder` + `<video>` | 🔄 `expo-camera` preview; smaller default (PIP) |
| **Screen / slides** | `useScreenCapture` + canvas JPEG every ~250ms | 🔄 **In-app deck viewer**: swipe slides → send frame + slide index to WS |
| **Panelist grid** | 8 avatars, Unsplash URLs | 🔄 2–3 visible on phone; bundled local avatars (no hotlink) |
| **Chat / text to AI** | Text input + send | ✅ Keep as secondary to voice |
| **Mic mute / cam off** | MediaStream track toggles | ✅ Same concept on native tracks |
| **Timer / 15 min session** | UI timer | ✅ Keep; warn before background kill on iOS |
| **End session** | `end_session` WS + parallel `POST /api/upload-video` (webm) | 🔄 End WS first; video upload **optional v1** (large on mobile) — audio + transcript may be enough |
| **Idle / auto-end** | Backend nudge + auto navigate to report | ✅ Keep server behavior |
| **Responsive tabs** | Panel / transcript / slides tabs on small web | ✅ Use bottom sheet tabs |

### Hooks to replace

| Web hook | Mobile replacement |
|----------|-------------------|
| `useScreenCapture.ts` | `DeckSlideViewer` + image encoder |
| `useMediaRecorder.ts` | `expo-camera` + `expo-av` recording |
| `useLiveAudio.ts` | Native module or adapted PCM pipeline |
| `useSocket.ts` | Unused in prod — **do not port** |

### Backend (small changes)

- Accept slide frames labeled `slideIndex` (may already work via WS messages — verify in `liveSocket.ts`).
- Optional: generate deck thumbnails server-side on upload for faster mobile viewer.
- CORS: mobile apps send **no Origin** — already allowed in `app.ts`; tighten in prod with API keys if needed.

---

## 7. Post-pitch report (`/report`)

| | |
|---|---|
| **Today** | Scores, radar chart (Recharts), strengths/risks, share + PDF buttons |
| **Mobile** | ✅ **High priority** after every pitch |
| **API** | `GET /api/sessions/:id` — no change |
| **UX** | 🔄 Radar → simpler score bars on narrow screens |
| **Share** | Buttons present; wire to **React Native Share** API |
| **PDF export** | ⏸️ Defer or use server-generated PDF link |

---

## 8. My pitches archive (`/archive`)

| | |
|---|---|
| **Today** | Search, filter, list, delete session, copy share link to clipboard |
| **Mobile** | ✅ **History tab** — card list instead of wide table |
| **API** | `GET /api/sessions`, `DELETE /api/sessions/:id` |
| **Share** | `navigator.clipboard` → **Share sheet** (`expo-sharing` / RN Share) |
| **Defer** | Complex filter UI → single sort dropdown |

---

## 9. Pitch replay (`/replay`)

| | |
|---|---|
| **Today** | Transcript timeline, session metadata |
| **Mobile** | ✅ v1 if transcript exists; ⏸️ **video replay** if upload skipped on mobile |
| **API** | Same session endpoint |
| **Note** | Share links point to web URL today — use **universal links** (`pitchnest.app/replay/...`) later |

---

## 10. Analytics (`/analytics`)

| | |
|---|---|
| **Today** | Area charts, tabs, progress stats from sessions |
| **Mobile** | ⏸️ **Defer v1** — or minimal “avg score + session count” on Home |
| **Reason** | Recharts-heavy; low priority vs live pitch loop |

---

## 11. Pitch decks (`/decks`)

| | |
|---|---|
| **Today** | Upload PDF (`react-dropzone`), list, delete |
| **Mobile** | ✅ **Decks tab** |
| **API** | `GET /api/decks`, `POST /api/upload-deck`, `DELETE /api/decks/:id` |
| **UX** | 🔄 `expo-document-picker` instead of drag-drop; show upload progress |
| **Work** | On upload, server extracts **page count + thumbnails** for mobile slide viewer |

---

## 12. Settings (`/settings`)

| | |
|---|---|
| **Today** | Tabs: profile, account, subscription, AI prefs, notifications — mostly **local UI state**, logout clears `localStorage` |
| **Mobile** | 🔄 **Profile tab** |

| Tab | Web | Mobile v1 |
|-----|-----|-----------|
| Profile | Display name/email, avatar (Dicebear) | ✅ Edit via `PATCH /api/profile` (wire if missing) |
| Account | Password, 2FA UI | 🔄 Change password; **delete account** (new) |
| Subscription | Placeholder UI | ⏸️ Hide until IAP, or free-only v1 |
| AI preferences | Local sliders | ⏸️ Or sync to profile API |
| Notifications | Local toggles | ⏸️ Until push notifications |
| Logout | Clear storage | ✅ Clear secure store + WS disconnect |
| Theme | `ThemeContext` | ✅ System / light / dark |

---

## 13. App shell (`AppLayout`)

| | |
|---|---|
| **Today** | Desktop sidebar + mobile drawer (already responsive) |
| **Mobile** | 🔄 **Replace entirely** with native tab bar + stack navigator |
| **Defer** | Top search bar, notification bell (non-functional today) |

---

## 14. Real-time & AI stack (cross-cutting)

```
[Mobile App]
    │  REST (auth, decks, sessions)
    │  WebSocket (live pitch only)
    ▼
[Node backend] ──► [Gemini Live WS]
    │
    ▼
[Supabase] sessions, users, decks
```

| Concern | Action |
|---------|--------|
| API base URL | `EXPO_PUBLIC_API_URL` — not relative `/api` |
| WebSocket URL | `wss://api.pitchnest.app` (derive from same host) |
| Auth header | `Authorization: Bearer` on REST + optional token on WS connect |
| Background | iOS may suspend app — pitch must stay **foreground**; show warning |
| Network | Retry WS; offline banner |
| AI disclosure | In-room label: “AI-generated feedback, not real investors” |

---

## Suggested mobile v1 scope (priority order)

1. **Auth** + onboarding + secure token  
2. **Decks** upload/select  
3. **Pre-pitch setup** (no screen share)  
4. **Live room** (mic + deck slides + WS)  
5. **Post-pitch report**  
6. **History** (archive list + delete)  
7. **Settings** (profile, legal links, delete account, logout)  

**Later:** Analytics, video replay upload, subscription/IAP, push, universal links, landing/waitlist.

---

## Engineering checklist (start here)

- [x] Add `mobile/` Expo app with tab navigation mirroring routes above  
- [x] `authFetch` equivalent with secure token + configurable API host  
- [x] Port `pitchConfig` types from `PrePitchSetup` / sessionStorage pattern  
- [x] Build `DeckSlideViewer` component (replaces `useScreenCapture`)  
- [x] Connect live room logic to native camera/mic (Expo camera + AV)  
- [ ] Backend: deck thumbnail extraction on upload (optional but helps mobile a lot)  
- [x] Remove or hide screen-share from mobile setup UI  
- [x] Bundle panelist avatars; drop Unsplash dependency on mobile  

---

*Last updated: May 2026*
