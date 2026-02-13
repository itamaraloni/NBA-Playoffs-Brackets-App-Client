# Workflow Orchestration

**Read this file at the start of every session**

> **Also read from the root `Playoff-Prophet/` directory:**
> - `METHODOLOGY.md` — work process, GitHub workflow, quality standards
> - `handover.md` — current project state, blockers, what to work on next

## Project Summary

Frontend for Playoff Prophet — React 18 + MUI 6 SPA for NBA Playoffs predictions.

**Stack:** React 18, Material-UI 6, React Router 7, Firebase Auth (Google SSO), Recharts, React Toastify. CRA-based build.

**Structure:**
- `src/pages/` — route-level page components (Dashboard, Predictions, League, Profile, etc.)
- `src/components/` — reusable UI (MatchupPredictionCard, StandingsTable, EditPicksDialog, etc.)
- `src/components/common/` — shared low-level components (ScoreCounter, MatchupScoreDisplay, etc.)
- `src/services/` — API client and service modules (ApiClient, UserServices, LeagueServices, etc.)
- `src/contexts/` — React context providers (AuthContext)
- `src/theme/` — MUI theme config and dark/light toggle

**Dev:** `npm start` (port 3000). Backend API URL configured via `REACT_APP_API_URL` in `.env`.

## Git Rules

- Open new branch for big changes, features, or bug fixes
- **Logical separation** — group related changes into separate commits
- **Concise messages** — informative yet brief
- **No co-author tags** — do NOT add "Co-Authored-By: Claude" or similar
- **Conventional format** — start with a verb (Add, Fix, Update, Refactor, Modify, etc.)

---

## Frontend Work — Educational Feedback

**User Request:** The primary developer (darchock) is less experienced with React and frontend development. When working on client repo issues, provide more informative and educational feedback:

- **Explain the "why"** — Don't just make changes, explain why this approach is better/correct
- **Reference React concepts** — When using hooks, context, or patterns, briefly explain what they do
- **Show alternatives** — If there are multiple ways to solve something, mention them and explain the trade-offs
- **Point out best practices** — Call out when following or deviating from React/MUI conventions
- **Explain side effects** — Describe how changes affect component lifecycle, re-renders, or state flow
- **Educational comments** — When code might be unclear, add brief inline comments explaining the pattern

**Example:** Instead of just "Added useCallback to prevent re-renders", say:
> "Added `useCallback` to memoize the `handleSubmit` function. This prevents the function from being recreated on every render, which would cause child components that receive it as a prop to re-render unnecessarily. This is a performance optimization common in React when passing callbacks to child components."

This guideline applies to all frontend work — code changes, PR reviews, planning, and debugging.

---

## Codebase Rules & Patterns

### Component Architecture

- **Functional components only** — no class components, use React Hooks
- **Page components** (`src/pages/`) own data fetching and page-level state. They orchestrate child components
- **Feature components** (`src/components/`) are reusable UI that receive data and callbacks via props
- **Common components** (`src/components/common/`) are small, highly reusable primitives (ScoreCounter, MatchupScoreDisplay, etc.)
- When a component grows beyond ~300 lines, extract sub-components into the same directory or `common/`

### Naming Conventions

- **Components:** PascalCase filenames (`MatchupPredictionCard.js`, `EditPicksDialog.jsx`)
- **Services/utils:** PascalCase filenames (`ApiClient.js`, `UserServices.js`)
- **Variables & functions:** camelCase (`playerProfile`, `handleSubmitPrediction`)
- **Event handler props:** `on` prefix (`onSubmit`, `onClose`)
- **Event handler functions:** `handle` prefix (`handleSubmitPrediction`, `handleLogout`)
- **Boolean state:** `is` prefix (`isAdmin`, `isLoading`, `isMobile`)
- **Constants:** UPPER_SNAKE_CASE (`PLAYER_AVATARS`, `NBA_TEAMS_WITH_POINTS`)
- **File extensions:** `.js` and `.jsx` are both used — match the convention of the file you're editing. For new files, prefer `.jsx` for components

### Environment Variables

- **REACT_APP_API_URL** — Backend API endpoint (dev: localhost:5000, prod: api.playoffprophet.com)
- **REACT_APP_FIREBASE_*** — Firebase config values (7 total, see .env.example for all)
  - `REACT_APP_FIREBASE_API_KEY` — Firebase API key
  - `REACT_APP_FIREBASE_AUTH_DOMAIN` — Firebase auth domain
  - `REACT_APP_FIREBASE_PROJECT_ID` — Firebase project ID
  - `REACT_APP_FIREBASE_STORAGE_BUCKET` — Firebase storage bucket
  - `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` — Firebase messaging sender ID
  - `REACT_APP_FIREBASE_APP_ID` — Firebase app ID
  - `REACT_APP_FIREBASE_MEASUREMENT_ID` — Firebase measurement ID (analytics)
- All env vars use Create React App's `REACT_APP_*` prefix (required for access via `process.env`)
- To set up locally: copy `.env.example` to `.env` and fill in your values
- Never commit `.env` — it's gitignored and contains environment-specific secrets
- Changing `.env` requires restarting the dev server (`npm start`)

### Styling

- **MUI `sx` prop is the primary styling method** — do NOT introduce CSS modules, styled-components, or new CSS files
- Use `useTheme()` hook to access theme palette, breakpoints, and shadows
- Responsive design via `useMediaQuery(theme.breakpoints.down('sm'))` — conditionally render or adjust `sx`
- Theme colors follow NBA palette: primary (blue), secondary (red) — defined in `src/theme/theme.js`
- Dark/light mode supported — always use theme tokens (`theme.palette.*`), never hardcode colors

### State Management

- **Global state:** React Context only (AuthContext for auth, ThemeContext for theme). No Redux or other state libraries
- **Page-level data:** `useState` in page components, fetched in `useEffect`
- **localStorage keys in use:** `auth_token`, `is_admin`, `player_id`, `player_name`, `league_id`, `theme-mode`, `joinLeagueId`
- When adding new persistent state, use localStorage directly — match the existing flat key pattern
- `theme-mode` is preserved on logout; all other keys are cleared
- **PENDING MIGRATION:** `auth_token` in localStorage is an XSS risk. Planned move to httpOnly cookies (requires backend changes). `is_admin` will also move to server-side verification only. Once these migrations land, update this section and the API & Services section accordingly

### API & Services

- **All API calls go through `apiClient`** (`src/services/ApiClient.js`) — never use `fetch` directly
- apiClient handles: auth headers (`Authorization: Bearer <token>`), retry with exponential backoff (3 retries), connection monitoring, 401 auto-logout
- **Service modules** (`UserServices`, `LeagueServices`, `MatchupServices`) are plain objects with async methods — not classes
- **Data transformation happens in services** — services convert snake_case API responses to camelCase UI objects before returning. Components should never deal with raw API response shapes
- **Notifications:** use `window.notify.success()`, `.error()`, `.warning()`, `.info()` (React Toastify via `NotificationService.js`). Always guard with `if (window.notify)`

### Data Fetching Pattern

Follow this pattern in page components:
```javascript
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await SomeService.getData();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, [dependencies]);
```

### Routing

- React Router v7 — routes defined in `src/App.js`
- All authenticated routes wrapped in `<ProtectedRoute>` and `<Layout>`
- Public routes: `/` (LandingPage)
- Pattern for new routes: add to `App.js`, create page in `src/pages/`, wrap in `<Layout>` for sidebar/nav

### Auth Flow

1. Google OAuth popup via Firebase `signInWithPopup()`
2. Token obtained via `user.getIdToken()` → stored as `auth_token` in localStorage
3. Backend sync via `UserServices.syncUserWithDatabase()`
4. `AuthContext` provides: `currentUser`, `isAuthenticated`, `signInWithGoogle()`, `logout()`
5. `useAuth()` hook to access auth state in any component

### Scoring & Rounds (reference for UI logic)

- Round codes: `playin_first`, `playin_second`, `first`, `second`, `conference_final`, `final`
- Play-in rounds: team selector only (no score prediction)
- Playoff rounds: score prediction via ScoreCounter (winner must have 4 wins)
- Points escalate by round — see `src/shared/GeneralConsts.js` for values

### Import Order Convention

```javascript
// 1. React & external libraries
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 2. MUI components
import { Container, Typography, Button } from '@mui/material';
import { MenuIcon } from '@mui/icons-material';

// 3. Internal components
import Layout from '../components/Layout';

// 4. Services
import UserServices from '../services/UserServices';

// 5. Contexts & hooks
import { useAuth } from '../contexts/AuthContext';

// 6. Constants & shared
import { PLAYER_AVATARS } from '../shared/GeneralConsts';
```

### Things to Avoid

- Do NOT add PropTypes or TypeScript — the codebase uses neither consistently
- Do NOT introduce new state management libraries (Redux, Zustand, etc.)
- Do NOT use inline styles (`style={}`) — use MUI `sx` prop instead
- Do NOT bypass `apiClient` for API calls
- Do NOT add new CSS files — use MUI theming and `sx`
- Do NOT store sensitive data in localStorage beyond auth tokens

---

### 1. Plan Mode Default
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately - don't keep pushing
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One task per subagent for focused execution

### 3. Self-Improvement Loop
- After ANY correction from the user: update 'tasks/lessons.md' with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for relevant project

### 4. Verification Before Done
- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness

### 5. Demand Elegance (Balanced)
- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes - don't over-engineer
- Challenge your own work before presenting it

### 6. Autonomous Bug Fixing
- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests -> then resolve them
- Zero context switching required from the user

## Task Management
1. **Plan First**: Write plan to 'tasks/todo.md' with checkable items
2. **Verify Plan**: Check in before starting implementation
3. **Track Progress**: Mark items complete as you go
4. **Explain Changes**: High-level summary at each step
5. **Document Results**: Add review to 'tasks/todo.md'
6. **Capture Lessons**: Update 'tasks/lessons.md' after corrections

## Core Principles
- **Simplicity First**: Make every change as simple as possible. Impact minimal code.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact**: Changes should only touch what's necessary. Avoid introducing bugs.
