# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

Record your plan here before editing code.

- Presentation tier decision: Use a shared capability card for request lifecycle and accessible loading, empty, and error states; keep API paths in page-specific loaders using the shared API client.
- Logic tier decision: Validate API inputs and referenced documents in the service layer, returning deliberate 400 responses for invalid activity or team input.
- Data tier decision: Require user name, email, and fitness goal; workout focus, minutes, and difficulty; activity references, type, minutes, points, and timestamp; and team name and mascot while defaulting members to an empty array.
- Activity tracking approach: Accept existing user/team IDs, require a non-empty type and positive minutes, compute points from minutes, and set the occurrence time on creation.
- Team management approach: Require a non-empty name and mascot, validate member IDs against existing users, and preserve member references in create/list responses.
- Leaderboard approach: Aggregate activity points per team, include teams with no activities at zero points, sort by points descending (then name), and assign 1-based ranks.
- Workout suggestions approach: Rank workouts by the user's fitness goal, then their five most recent activity types; include a reason for each suggestion and return 404 for an unknown email.

## Test plan

Record the commands you run and what each failure means.

- Data-tier command: `npm run test:data --prefix octofit-tracker/backend`
- API command: `npm run test:api --prefix octofit-tracker/backend`
- Frontend command: `npm test --prefix octofit-tracker/frontend`
- Backend build command: `npm run build --prefix octofit-tracker/backend`
- Frontend build command: `npm run build --prefix octofit-tracker/frontend`
- Verified API command and backend build: all 4 API contract tests passed and the backend TypeScript build passed. API failures indicate a route/service contract regression; build failures indicate backend type errors.
- Verified frontend command and build: all 15 frontend tests passed and the frontend production build passed. Frontend test failures indicate a data-rendering or accessible-state regression; build failures indicate frontend type or bundling errors.
- Verified data command: all 5 data contract tests passed, including required-field checks for User and Workout models.
