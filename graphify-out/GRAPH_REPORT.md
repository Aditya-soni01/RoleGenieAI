# Graph Report - D:\Repos\RoleGenie\ai-job-assistant-api  (2026-05-01)

## Corpus Check
- 90 files · ~73,986 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 859 nodes · 1669 edges · 88 communities detected
- Extraction: 59% EXTRACTED · 41% INFERRED · 0% AMBIGUOUS · INFERRED: 679 edges (avg confidence: 0.58)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 67|Community 67]]
- [[_COMMUNITY_Community 68|Community 68]]
- [[_COMMUNITY_Community 69|Community 69]]
- [[_COMMUNITY_Community 70|Community 70]]
- [[_COMMUNITY_Community 71|Community 71]]
- [[_COMMUNITY_Community 72|Community 72]]
- [[_COMMUNITY_Community 73|Community 73]]
- [[_COMMUNITY_Community 74|Community 74]]
- [[_COMMUNITY_Community 75|Community 75]]
- [[_COMMUNITY_Community 76|Community 76]]
- [[_COMMUNITY_Community 77|Community 77]]
- [[_COMMUNITY_Community 78|Community 78]]
- [[_COMMUNITY_Community 79|Community 79]]
- [[_COMMUNITY_Community 80|Community 80]]
- [[_COMMUNITY_Community 81|Community 81]]
- [[_COMMUNITY_Community 82|Community 82]]
- [[_COMMUNITY_Community 83|Community 83]]
- [[_COMMUNITY_Community 84|Community 84]]
- [[_COMMUNITY_Community 85|Community 85]]
- [[_COMMUNITY_Community 86|Community 86]]
- [[_COMMUNITY_Community 87|Community 87]]

## God Nodes (most connected - your core abstractions)
1. `User` - 119 edges
2. `AuthService` - 74 edges
3. `Job` - 46 edges
4. `AIRequestLog` - 36 edges
5. `AIService` - 31 edges
6. `AnalyticsService` - 30 edges
7. `AIRequestType` - 23 edges
8. `Token` - 21 edges
9. `Save AI-parsed resume data into all profile tables.` - 20 edges
10. `LoginRequest` - 18 edges

## Surprising Connections (you probably didn't know these)
- `add_project()` --calls--> `UserProject`  [INFERRED]
  D:\Repos\RoleGenie\ai-job-assistant-api\app\routes\profile.py → D:\Repos\RoleGenie\ai-job-assistant-api\app\models\profile.py
- `Get SQLAlchemy database URL from settings.          Returns:         Database` --uses--> `User`  [INFERRED]
  D:\Repos\RoleGenie\ai-job-assistant-api\alembic\env.py → D:\Repos\RoleGenie\ai-job-assistant-api\app\models\user.py
- `Get SQLAlchemy database URL from settings.          Returns:         Database` --uses--> `Job`  [INFERRED]
  D:\Repos\RoleGenie\ai-job-assistant-api\alembic\env.py → D:\Repos\RoleGenie\ai-job-assistant-api\app\models\job.py
- `Run migrations in 'offline' mode.          This configures the context with ju` --uses--> `User`  [INFERRED]
  D:\Repos\RoleGenie\ai-job-assistant-api\alembic\env.py → D:\Repos\RoleGenie\ai-job-assistant-api\app\models\user.py
- `Run migrations in 'offline' mode.          This configures the context with ju` --uses--> `Job`  [INFERRED]
  D:\Repos\RoleGenie\ai-job-assistant-api\alembic\env.py → D:\Repos\RoleGenie\ai-job-assistant-api\app\models\job.py

## Hyperedges (group relationships)
- **Root Causes of GENERATE OPTIMIZED RESUME Button Failure** — conv_generate_optimized_resume_button, conv_root_cause_1_api_key, conv_root_cause_2_zombie_processes, conv_root_cause_3_corrupted_db_records, conv_root_cause_4_original_content_corrupted [EXTRACTED 1.00]
- **2-Stage AI Pipeline Components** — conv_two_stage_ai_pipeline, conv_analyze_resume_job_fit, conv_generate_optimized_resume_method, conv_ai_service_py [EXTRACTED 1.00]
- **Fixes Applied to Resolve Button Issue** — conv_fix_api_key_passing, conv_fix_zombie_processes, conv_fix_corrupted_db, conv_resumes_py, conv_ai_service_py, conv_sqlite_db [EXTRACTED 1.00]
- **Frontend ResumePage Components** — conv_resume_page_tsx, conv_loading_progress, conv_ats_score_bar, conv_try_parse_optimization_result, conv_optimize_mutation [EXTRACTED 1.00]

## Communities

### Community 0 - "Community 0"
Cohesion: 0.04
Nodes (92): AIRequestLog, AIRequestType, SQLAlchemy model for logging AI API requests per user.          Used for:, Convert model to dictionary., Enum for types of AI requests., JWT token payload schema.          Extracted from JWT token during authenticat, AuthService, get_current_admin() (+84 more)

### Community 1 - "Community 1"
Cohesion: 0.08
Nodes (60): AdminBootstrapRequest, AdminUserStatusUpdate, Authenticate an admin user with the existing JWT auth mechanism., Create or promote the first admin account using ADMIN_BOOTSTRAP_TOKEN., ActivityEventCreate, Record a product analytics event from the frontend., record_event(), AnalyticsService (+52 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (29): AIService, _extract_text(), _OpenAIClientAdapter, _OpenAIMessagesAdapter, _OpenRouterClientAdapter, _OpenRouterMessagesAdapter, _ProviderResponse, Stage 1 v2 — profile-aware fit analysis.         Uses structured profile as pri (+21 more)

### Community 3 - "Community 3"
Cohesion: 0.05
Nodes (54): _dedupe_keep_order(), _docx_base(), _docx_sidebar(), _docx_t1(), _docx_t10(), _docx_t2(), _docx_t3(), _docx_t4() (+46 more)

### Community 4 - "Community 4"
Cohesion: 0.07
Nodes (28): change_password(), login(), register(), create_access_token(), create_refresh_token(), decode_token(), get_current_user(), get_optional_current_user() (+20 more)

### Community 5 - "Community 5"
Cohesion: 0.08
Nodes (36): build_resume_filename(), Filename builder for exported resume files.  Format:  <UserName>_<JobTitle>.<e, Build a safe, human-readable filename for exported resume files.      Rules:, create_resume(), get_resume(), get_user_resumes(), update_optimized(), _assert_template_access() (+28 more)

### Community 6 - "Community 6"
Cohesion: 0.13
Nodes (33): ActivityEvent, AdminAuditLog, Best-effort SaaS session summary derived from page views and events., Audit log for sensitive admin actions., Append-only product analytics event., UserSession, Product analytics helpers for append-only events and admin reporting., Write an append-only event and update the best-effort session summary. (+25 more)

### Community 7 - "Community 7"
Cohesion: 0.09
Nodes (33): benchmark_pair(), count_tokens(), main(), print_table(), main(), print_usage(), build_compress_prompt(), build_fix_prompt() (+25 more)

### Community 8 - "Community 8"
Cohesion: 0.07
Nodes (37): app/services/ai_service.py, analyze_resume_job_fit() - Stage 1 AI Pipeline, Anthropic Python SDK, ATSScoreBar Component, ATS Score Improvement Result (48 to 78), _build_docx() Helper Function, _build_pdf() Helper Function, /download/docx Endpoint (+29 more)

### Community 9 - "Community 9"
Cohesion: 0.12
Nodes (34): AIErrorResponse, calculate_match_score(), CoverLetterRequest, CoverLetterResponse, generate_cover_letter(), improve_section(), InterviewPrepRequest, InterviewPrepResponse (+26 more)

### Community 10 - "Community 10"
Cohesion: 0.12
Nodes (25): admin_login(), _available_username(), bootstrap_first_admin(), get_dashboard_stats(), get_errors_summary(), get_funnel_analytics(), get_recent_events(), get_subscriptions_summary() (+17 more)

### Community 11 - "Community 11"
Cohesion: 0.12
Nodes (18): Enum, can_use_template(), get_template(), get_templates_for_plan(), plan_from_string(), PlanTier, Plan definitions, template registry, and permission helpers for RoleGenie.  Si, Return template metadata by id, or None if not found.     Accepts both legacy ' (+10 more)

### Community 12 - "Community 12"
Cohesion: 0.13
Nodes (17): summarize_provider_error(), add_certification(), add_education(), add_experience(), add_project(), add_skill(), calculate_completeness(), delete_certification() (+9 more)

### Community 13 - "Community 13"
Cohesion: 0.1
Nodes (18): drop_db(), ensure_sqlite_schema_compatibility(), get_db(), get_engine(), init_db(), Drop all tables from the database.     Use with caution - this is typically onl, Get the SQLAlchemy engine instance.      Returns:         Engine: The configu, Enable foreign key support for SQLite.     This event listener runs on each dat (+10 more)

### Community 14 - "Community 14"
Cohesion: 0.12
Nodes (8): BaseSettings, Config, parse_allowed_origins(), Application settings loaded from environment variables with type validation., Settings, test_openrouter_adapter_uses_chat_completions(), test_settings_supports_anthropic_key_and_default_model(), test_settings_supports_openrouter_key_and_default_model()

### Community 15 - "Community 15"
Cohesion: 0.13
Nodes (3): auth_headers(), override_get_db(), setup_teardown()

### Community 16 - "Community 16"
Cohesion: 0.18
Nodes (10): get_experience_level_analysis_prompt(), get_improvement_suggestions_prompt(), get_keyword_extraction_prompt(), get_match_score_analysis_prompt(), get_skills_deep_dive_prompt(), Generate prompt for detailed skills analysis and proficiency assessment., Generate prompt for experience level and seniority assessment.          Evalua, Generate prompt for comprehensive job-resume match analysis.          Analyzes (+2 more)

### Community 17 - "Community 17"
Cohesion: 0.42
Nodes (9): _add_user_column_if_missing(), _column_names(), _create_index_if_missing(), _create_users_if_missing(), downgrade(), _index_names(), Add profile tables and user profile columns.  Revision ID: 004 Revises: 003, _table_names() (+1 more)

### Community 18 - "Community 18"
Cohesion: 0.2
Nodes (2): Collection of prompt templates for resume optimization using Claude API.     Pr, ResumePrompts

### Community 19 - "Community 19"
Cohesion: 0.31
Nodes (6): downloadBlob(), handleCopyText(), handleDownload(), handleImproveSection(), handleOptimize(), showToast()

### Community 20 - "Community 20"
Cohesion: 0.5
Nodes (8): _add_column_if_missing(), _column_names(), _create_index_if_missing(), downgrade(), _index_names(), Add admin analytics tables.  Revision ID: 006 Revises: 005 Create Date: 2026, _table_names(), upgrade()

### Community 21 - "Community 21"
Cohesion: 0.22
Nodes (2): CoverLetterPrompts, Collection of prompt templates for cover letter generation using Claude API.

### Community 22 - "Community 22"
Cohesion: 0.25
Nodes (3): ProtectedRoute(), PublicRoute(), isAuthenticated()

### Community 23 - "Community 23"
Cohesion: 0.33
Nodes (5): downgrade(), Add job fields: category, skills, salary, experience_level.  Revision ID: 002, Create or patch the jobs table.      Older local SQLite databases in this proj, Remove added columns from jobs table., upgrade()

### Community 24 - "Community 24"
Cohesion: 0.33
Nodes (5): downgrade(), Add ai_request_log table for tracking AI API requests.  Revision ID: 003 Revi, Create or patch ai_request_logs table., Drop ai_request_logs table., upgrade()

### Community 25 - "Community 25"
Cohesion: 0.4
Nodes (0): 

### Community 26 - "Community 26"
Cohesion: 0.4
Nodes (0): 

### Community 27 - "Community 27"
Cohesion: 0.5
Nodes (1): Add is_admin column to users table.  Revision ID: 005 Revises: 004 Create Da

### Community 28 - "Community 28"
Cohesion: 0.5
Nodes (3): get_template_config(), Resume template configuration — Python source of truth for PDF/DOCX generation., Return the config dict for a slug ID, or the default if not found.

### Community 29 - "Community 29"
Cohesion: 0.67
Nodes (0): 

### Community 30 - "Community 30"
Cohesion: 1.0
Nodes (0): 

### Community 31 - "Community 31"
Cohesion: 1.0
Nodes (0): 

### Community 32 - "Community 32"
Cohesion: 1.0
Nodes (0): 

### Community 33 - "Community 33"
Cohesion: 1.0
Nodes (0): 

### Community 34 - "Community 34"
Cohesion: 1.0
Nodes (0): 

### Community 35 - "Community 35"
Cohesion: 1.0
Nodes (0): 

### Community 36 - "Community 36"
Cohesion: 1.0
Nodes (0): 

### Community 37 - "Community 37"
Cohesion: 1.0
Nodes (0): 

### Community 38 - "Community 38"
Cohesion: 1.0
Nodes (0): 

### Community 39 - "Community 39"
Cohesion: 1.0
Nodes (1): Caveman compress scripts.  This package provides tools to compress natural lan

### Community 40 - "Community 40"
Cohesion: 1.0
Nodes (0): 

### Community 41 - "Community 41"
Cohesion: 1.0
Nodes (1): Parse comma-separated string of origins into list.

### Community 42 - "Community 42"
Cohesion: 1.0
Nodes (1): Validate supported AI provider names.

### Community 43 - "Community 43"
Cohesion: 1.0
Nodes (1): Validate that app_env is one of allowed values.

### Community 44 - "Community 44"
Cohesion: 1.0
Nodes (1): Parse common deployment-style DEBUG values.          Some Windows/Node toolcha

### Community 45 - "Community 45"
Cohesion: 1.0
Nodes (1): Validate that log_level is a valid logging level.

### Community 46 - "Community 46"
Cohesion: 1.0
Nodes (1): Check if running in production environment.

### Community 47 - "Community 47"
Cohesion: 1.0
Nodes (1): Check if running in development environment.

### Community 48 - "Community 48"
Cohesion: 1.0
Nodes (1): Return the API key for the selected AI provider.

### Community 49 - "Community 49"
Cohesion: 1.0
Nodes (1): Return the model for the selected AI provider with legacy fallback.

### Community 50 - "Community 50"
Cohesion: 1.0
Nodes (0): 

### Community 51 - "Community 51"
Cohesion: 1.0
Nodes (0): 

### Community 52 - "Community 52"
Cohesion: 1.0
Nodes (1): Calculate total tokens used for this request.

### Community 53 - "Community 53"
Cohesion: 1.0
Nodes (1): Check if request was successful.

### Community 54 - "Community 54"
Cohesion: 1.0
Nodes (1): Calculate duration in seconds.

### Community 55 - "Community 55"
Cohesion: 1.0
Nodes (0): 

### Community 56 - "Community 56"
Cohesion: 1.0
Nodes (1): Generate prompt for cover letter creation tailored to specific job.          A

### Community 57 - "Community 57"
Cohesion: 1.0
Nodes (1): Generate prompt for customizing an existing cover letter.          Args:

### Community 58 - "Community 58"
Cohesion: 1.0
Nodes (1): Generate prompt for adjusting the tone of a cover letter.          Args:

### Community 59 - "Community 59"
Cohesion: 1.0
Nodes (1): Generate prompt for analyzing and scoring cover letter effectiveness.

### Community 60 - "Community 60"
Cohesion: 1.0
Nodes (1): Generate prompt for cover letter addressing career transition.          Args:

### Community 61 - "Community 61"
Cohesion: 1.0
Nodes (1): Generate prompt for creating multiple cover letters in one request.          A

### Community 62 - "Community 62"
Cohesion: 1.0
Nodes (1): Generate prompt for ATS keyword injection and optimization.          Args:

### Community 63 - "Community 63"
Cohesion: 1.0
Nodes (1): Generate prompt for analyzing skill alignment with job requirements.

### Community 64 - "Community 64"
Cohesion: 1.0
Nodes (1): Generate prompt for general resume content and structure improvements.

### Community 65 - "Community 65"
Cohesion: 1.0
Nodes (1): Generate prompt for tailored cover letter generation.          Args:

### Community 66 - "Community 66"
Cohesion: 1.0
Nodes (1): Generate prompt for resume formatting and visual presentation analysis.

### Community 67 - "Community 67"
Cohesion: 1.0
Nodes (1): Generate prompt for identifying and enhancing most relevant experiences.

### Community 68 - "Community 68"
Cohesion: 1.0
Nodes (1): Generate prompt for quick, general resume feedback.          Args:

### Community 69 - "Community 69"
Cohesion: 1.0
Nodes (0): 

### Community 70 - "Community 70"
Cohesion: 1.0
Nodes (0): 

### Community 71 - "Community 71"
Cohesion: 1.0
Nodes (0): 

### Community 72 - "Community 72"
Cohesion: 1.0
Nodes (1): Return a concise, user-safe explanation for common AI provider errors.

### Community 73 - "Community 73"
Cohesion: 1.0
Nodes (0): 

### Community 74 - "Community 74"
Cohesion: 1.0
Nodes (0): 

### Community 75 - "Community 75"
Cohesion: 1.0
Nodes (0): 

### Community 76 - "Community 76"
Cohesion: 1.0
Nodes (0): 

### Community 77 - "Community 77"
Cohesion: 1.0
Nodes (0): 

### Community 78 - "Community 78"
Cohesion: 1.0
Nodes (0): 

### Community 79 - "Community 79"
Cohesion: 1.0
Nodes (0): 

### Community 80 - "Community 80"
Cohesion: 1.0
Nodes (0): 

### Community 81 - "Community 81"
Cohesion: 1.0
Nodes (0): 

### Community 82 - "Community 82"
Cohesion: 1.0
Nodes (0): 

### Community 83 - "Community 83"
Cohesion: 1.0
Nodes (0): 

### Community 84 - "Community 84"
Cohesion: 1.0
Nodes (0): 

### Community 85 - "Community 85"
Cohesion: 1.0
Nodes (0): 

### Community 86 - "Community 86"
Cohesion: 1.0
Nodes (0): 

### Community 87 - "Community 87"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **168 isolated node(s):** `Add job fields: category, skills, salary, experience_level.  Revision ID: 002`, `Create or patch the jobs table.      Older local SQLite databases in this proj`, `Remove added columns from jobs table.`, `Add ai_request_log table for tracking AI API requests.  Revision ID: 003 Revi`, `Create or patch ai_request_logs table.` (+163 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 30`** (2 nodes): `OnboardingTour.tsx`, `handleFileUpload()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 31`** (2 nodes): `ResumeTemplatePreview.tsx`, `buildPreviewSvg()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 32`** (2 nodes): `ErrorAlert.tsx`, `ErrorAlert()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (2 nodes): `LoadingSpinner.tsx`, `LoadingSpinner()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 34`** (2 nodes): `SuccessAlert.tsx`, `SuccessAlert()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 35`** (2 nodes): `DashboardPage.tsx`, `tryParseOptimized()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 36`** (2 nodes): `OAuthCallbackPage.tsx`, `OAuthCallbackPage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 37`** (2 nodes): `SubscriptionPage.tsx`, `CtaButton()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 38`** (2 nodes): `SupportPage.tsx`, `handleSubmit()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 39`** (2 nodes): `__init__.py`, `Caveman compress scripts.  This package provides tools to compress natural lan`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 40`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 41`** (1 nodes): `Parse comma-separated string of origins into list.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 42`** (1 nodes): `Validate supported AI provider names.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 43`** (1 nodes): `Validate that app_env is one of allowed values.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 44`** (1 nodes): `Parse common deployment-style DEBUG values.          Some Windows/Node toolcha`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 45`** (1 nodes): `Validate that log_level is a valid logging level.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 46`** (1 nodes): `Check if running in production environment.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 47`** (1 nodes): `Check if running in development environment.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 48`** (1 nodes): `Return the API key for the selected AI provider.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 49`** (1 nodes): `Return the model for the selected AI provider with legacy fallback.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 50`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 51`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 52`** (1 nodes): `Calculate total tokens used for this request.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 53`** (1 nodes): `Check if request was successful.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 54`** (1 nodes): `Calculate duration in seconds.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 55`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 56`** (1 nodes): `Generate prompt for cover letter creation tailored to specific job.          A`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 57`** (1 nodes): `Generate prompt for customizing an existing cover letter.          Args:`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 58`** (1 nodes): `Generate prompt for adjusting the tone of a cover letter.          Args:`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 59`** (1 nodes): `Generate prompt for analyzing and scoring cover letter effectiveness.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 60`** (1 nodes): `Generate prompt for cover letter addressing career transition.          Args:`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 61`** (1 nodes): `Generate prompt for creating multiple cover letters in one request.          A`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 62`** (1 nodes): `Generate prompt for ATS keyword injection and optimization.          Args:`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 63`** (1 nodes): `Generate prompt for analyzing skill alignment with job requirements.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 64`** (1 nodes): `Generate prompt for general resume content and structure improvements.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 65`** (1 nodes): `Generate prompt for tailored cover letter generation.          Args:`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 66`** (1 nodes): `Generate prompt for resume formatting and visual presentation analysis.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 67`** (1 nodes): `Generate prompt for identifying and enhancing most relevant experiences.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 68`** (1 nodes): `Generate prompt for quick, general resume feedback.          Args:`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 69`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 70`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 71`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 72`** (1 nodes): `Return a concise, user-safe explanation for common AI provider errors.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 73`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 74`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 75`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 76`** (1 nodes): `postcss.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 77`** (1 nodes): `tailwind.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 78`** (1 nodes): `vite.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 79`** (1 nodes): `main.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 80`** (1 nodes): `vite-env.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 81`** (1 nodes): `Pagination.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 82`** (1 nodes): `AppLayout.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 83`** (1 nodes): `Sidebar.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 84`** (1 nodes): `TemplateSelector.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 85`** (1 nodes): `resumeTemplates.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 86`** (1 nodes): `ProfilePage.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 87`** (1 nodes): `greenlet.h`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `User` connect `Community 0` to `Community 1`, `Community 4`, `Community 6`, `Community 9`, `Community 10`, `Community 11`?**
  _High betweenness centrality (0.194) - this node is a cross-community bridge._
- **Why does `call_claude()` connect `Community 7` to `Community 2`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **Why does `AIService` connect `Community 2` to `Community 9`, `Community 6`, `Community 14`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._
- **Are the 112 inferred relationships involving `User` (e.g. with `Get SQLAlchemy database URL from settings.          Returns:         Database` and `Run migrations in 'offline' mode.          This configures the context with ju`) actually correct?**
  _`User` has 112 INFERRED edges - model-reasoned connections that need verification._
- **Are the 72 inferred relationships involving `AuthService` (e.g. with `AdminBootstrapRequest` and `AdminUserStatusUpdate`) actually correct?**
  _`AuthService` has 72 INFERRED edges - model-reasoned connections that need verification._
- **Are the 41 inferred relationships involving `Job` (e.g. with `Get SQLAlchemy database URL from settings.          Returns:         Database` and `Run migrations in 'offline' mode.          This configures the context with ju`) actually correct?**
  _`Job` has 41 INFERRED edges - model-reasoned connections that need verification._
- **Are the 41 inferred relationships involving `str` (e.g. with `parse_allowed_origins()` and `get_db()`) actually correct?**
  _`str` has 41 INFERRED edges - model-reasoned connections that need verification._