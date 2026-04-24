# RoleGenie AI Job Assistant API

RoleGenie is a full-stack AI resume optimization platform. Users can sign up, build a structured professional profile, upload resumes, paste a target job description, generate an optimized version of their resume, preview it in multiple templates, and export the result as PDF or DOCX. The app also includes analytics instrumentation, admin dashboards, OAuth login, and provider-configurable AI integrations.

## Project Summary

This project is built around one core workflow: turn a raw resume plus a job description into a tailored, ATS-friendly output.

Main product capabilities:
- Email/password and OAuth authentication
- User profile management with skills, experience, projects, education, and certifications
- Resume upload and text extraction from PDF, DOCX, and text files
- AI-powered resume optimization using OpenAI, Anthropic, or OpenRouter
- Resume template selection and export to PDF/DOCX
- User activity and funnel analytics
- Admin dashboard for users, subscriptions, analytics, and errors

## Tech Stack

### Backend
- Python 3
- FastAPI
- SQLAlchemy 2
- Alembic
- Pydantic v2 / `pydantic-settings`
- JWT auth via `python-jose`
- Password hashing via `passlib` + `bcrypt`
- File parsing with `pypdf` and `python-docx`
- PDF/DOCX generation with `reportlab` and `python-docx`

### Frontend
- React 18
- TypeScript
- Vite
- React Router
- TanStack Query
- Zustand
- Axios
- Tailwind CSS
- Lucide React

### Data and Infrastructure
- SQLite by default (`ai_job_assistant.db`)
- Environment-based configuration via `.env`
- CORS-configured FastAPI API
- Optional OAuth integrations for Google and GitHub
- Configurable AI providers:
  - OpenAI
  - Anthropic
  - OpenRouter

## Folder Structure

```text
ai-job-assistant-api/
|- app/
|  |- core/            # config, database, plans, rate limiting
|  |- data/            # mock and supporting data
|  |- models/          # SQLAlchemy models
|  |- prompts/         # AI prompt builders
|  |- routes/          # FastAPI routers
|  |- schemas/         # Pydantic request/response schemas
|  |- services/        # business logic and integrations
|  |- templates/       # resume template metadata
|  |- utils/           # helper utilities
|  `- main.py          # FastAPI entry point
|- alembic/            # database migrations
|- docs/               # project docs, including AI provider setup
|- frontend/
|  |- src/
|  |  |- components/   # layout, resume, common, analytics UI
|  |  |- data/         # frontend template registry/data
|  |  |- lib/          # API client and analytics helpers
|  |  |- pages/        # app pages and admin pages
|  |  `- store/        # Zustand auth store
|  |- package.json
|  `- vite.config.ts
|- tests/              # backend tests
|- .env.example
|- requirements.txt
`- README.md
```

## Backend Module Map

### `app/core`
- `config.py`: loads environment variables and resolves AI provider/model settings
- `database.py`: SQLAlchemy engine, base model setup, DB session helpers
- `plans.py`: plan tiers and template access rules
- `rate_limiter.py`: optional rate limiting support

### `app/routes`
- `auth.py`: register, login, logout, current user, password reset
- `oauth.py`: Google and GitHub OAuth flow
- `profile.py`: structured user profile CRUD and resume parsing into profile data
- `resumes.py`: upload, optimize, list, delete, download
- `templates.py`: template catalog and plan-gated template access
- `ai.py`: direct AI endpoints for optimization, cover letter, match score, section improvement
- `analytics.py`: product analytics event ingestion
- `admin.py`: admin login, dashboard, users, subscriptions, analytics, errors

### `app/services`
- `auth_service.py`: password hashing, JWT creation/validation, auth dependencies
- `ai_service.py`: provider adapters and AI orchestration
- `resume_service.py`: resume persistence helpers
- `template_service.py`: PDF/DOCX generation
- `analytics_service.py`: funnel, event, admin metrics logic

### `app/models`
- `user.py`: user account and profile summary fields
- `resume.py`: uploaded resume and optimized content
- `profile.py`: normalized profile entities like skills and experience
- `activity.py`: analytics events, sessions, admin audit logs
- `ai_request_log.py`: AI request logs
- `password_reset.py`: password reset tokens

## Frontend Module Map

### Main pages
- `LandingPage.tsx`: public marketing/entry page
- `LoginPage.tsx`: login, registration, forgot-password UI
- `DashboardPage.tsx`: usage stats and recent optimizations
- `ResumePage.tsx`: upload, optimize, preview, compare, download
- `ProfilePage.tsx`: structured profile editor and resume-to-profile parsing
- `SettingsPage.tsx`: account settings and preferences
- `SubscriptionPage.tsx`: plan and upgrade UI
- `SupportPage.tsx`: FAQ/support content

### Admin pages
- `pages/admin/AdminLayout.tsx`
- `pages/admin/AdminLoginPage.tsx`
- `pages/admin/AdminPages.tsx`

### Shared frontend layers
- `lib/api.ts`: centralized Axios client
- `store/authStore.ts`: persisted auth/session store
- `components/resume/*`: resume template gallery and optimized resume rendering
- `components/layout/*`: main authenticated app shell

## Application Flow

### 1. Authentication flow
1. User opens the frontend and lands on `/` or `/login`.
2. Frontend calls `/api/auth/register` or `/api/auth/login`.
3. Backend validates credentials, creates JWT access/refresh tokens, and returns them.
4. Frontend stores the access token in Zustand/localStorage.
5. Protected routes render only when auth state is present.

### 2. Profile setup flow
1. After login, the app fetches `/api/profile`.
2. If the profile is incomplete, onboarding encourages the user to fill it in.
3. User can manually add skills, experience, projects, education, and certifications.
4. User can also upload a resume for parsing into structured profile data through `/api/profile/parse-resume`.

### 3. Resume upload flow
1. User uploads a resume from the Resume page.
2. Frontend posts the file to `/api/resumes/upload`.
3. Backend extracts text from PDF/DOCX/TXT and stores the raw content in the `resumes` table.
4. Uploaded resumes appear in the user's resume list.

### 4. Resume optimization flow
1. User selects a stored resume.
2. User pastes a job description and optionally enters job title, company, tone, and template.
3. Frontend calls `/api/resumes/{resume_id}/optimize`.
4. Backend:
   - loads the resume text
   - loads the structured profile
   - decides whether to run the profile-aware or raw-resume optimization path
   - sends prompts through `AIService`
   - stores `{analysis, optimized, template_id, job_title, company}` into `optimized_content`
5. Frontend displays:
   - ATS before/after score
   - optimization suggestions
   - optimized resume preview
   - template-based render output

### 5. Download flow
1. User chooses PDF or DOCX export.
2. Frontend calls:
   - `/api/resumes/{resume_id}/download/pdf`
   - `/api/resumes/{resume_id}/download/docx`
3. Backend normalizes optimized content and passes it to `template_service`.
4. Generated file is streamed back to the browser.

### 6. Analytics flow
1. Important actions like signup, login, resume upload, optimization start/completion, and downloads are logged.
2. Events are stored in `activity_events`.
3. Admin endpoints aggregate these events into funnel, user, subscription, and error views.

### 7. Admin flow
1. Admin logs in through `/api/admin/login`.
2. Frontend routes to admin pages behind admin-only guards.
3. Admin dashboard queries backend analytics and user-management endpoints.

## API Surface

Main API groups exposed by `app/main.py`:
- `/api/auth`
- `/api/auth/oauth`
- `/api/admin`
- `/api/analytics`
- `/api/ai`
- `/api/resumes`
- `/api/templates`
- `/api/profile`

Health endpoints:
- `/`
- `/health`

## AI Provider Support

The backend can switch providers via `.env`.

Key settings:
- `AI_PROVIDER=openai|anthropic|openrouter`
- `AI_MODEL=<provider model id>`
- `OPENAI_API_KEY=...`
- `ANTHROPIC_API_KEY=...`
- `OPENROUTER_API_KEY=...`

See [AI_PROVIDER_CONFIGURATION.md](/d:/Repos/RoleGenie/ai-job-assistant-api/docs/AI_PROVIDER_CONFIGURATION.md) for examples.

## Local Development

### Backend
```bash
pip install -r requirements.txt
python app/main.py
```

Backend runs on:
```text
http://localhost:8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:
```text
http://localhost:5173
```

## Environment Variables

Core values you will typically set:
- `SECRET_KEY`
- `DATABASE_URL`
- `CORS_ORIGINS`
- `AI_PROVIDER`
- `AI_MODEL`
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `OPENROUTER_API_KEY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`

## Notes

- SQLite is the default database for local development.
- Resume optimization history is stored inside `resumes.optimized_content` as JSON.
- Template access is plan-aware and enforced in the backend.
- Some existing tests in `tests/` are not fully aligned with the current route and payload shapes.
