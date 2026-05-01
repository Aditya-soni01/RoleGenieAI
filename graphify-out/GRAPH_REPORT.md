# Graph Report - ai-job-assistant-api  (2026-05-01)

## Corpus Check
- 94 files · ~65,579 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 741 nodes · 1282 edges · 49 communities detected
- Extraction: 61% EXTRACTED · 39% INFERRED · 0% AMBIGUOUS · INFERRED: 495 edges (avg confidence: 0.55)
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
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
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

## God Nodes (most connected - your core abstractions)
1. `User` - 103 edges
2. `AuthService` - 69 edges
3. `Job` - 46 edges
4. `AIRequestLog` - 33 edges
5. `AIService` - 26 edges
6. `AIRequestType` - 23 edges
7. `Save AI-parsed resume data into all profile tables.` - 20 edges
8. `Token` - 15 edges
9. `TokenData` - 14 edges
10. `UserResponse` - 14 edges

## Surprising Connections (you probably didn't know these)
- `Rate limiter for AI API calls using database log counts.          Enforces lim` --uses--> `AIRequestLog`  [INFERRED]
  app\core\rate_limiter.py → app\models\ai_request_log.py
- `Initialize rate limiter with configurable limits.          Args:` --uses--> `AIRequestLog`  [INFERRED]
  app\core\rate_limiter.py → app\models\ai_request_log.py
- `Check if user has exceeded rate limits.          Args:             user_id: I` --uses--> `AIRequestLog`  [INFERRED]
  app\core\rate_limiter.py → app\models\ai_request_log.py
- `Log an AI API request to the database.          Args:             user_id: ID` --uses--> `AIRequestLog`  [INFERRED]
  app\core\rate_limiter.py → app\models\ai_request_log.py
- `Get comprehensive usage statistics for a user.          Args:             use` --uses--> `AIRequestLog`  [INFERRED]
  app\core\rate_limiter.py → app\models\ai_request_log.py

## Hyperedges (group relationships)
- **Root Causes of GENERATE OPTIMIZED RESUME Button Failure** — conv_generate_optimized_resume_button, conv_root_cause_1_api_key, conv_root_cause_2_zombie_processes, conv_root_cause_3_corrupted_db_records, conv_root_cause_4_original_content_corrupted [EXTRACTED 1.00]
- **2-Stage AI Pipeline Components** — conv_two_stage_ai_pipeline, conv_analyze_resume_job_fit, conv_generate_optimized_resume_method, conv_ai_service_py [EXTRACTED 1.00]
- **Fixes Applied to Resolve Button Issue** — conv_fix_api_key_passing, conv_fix_zombie_processes, conv_fix_corrupted_db, conv_resumes_py, conv_ai_service_py, conv_sqlite_db [EXTRACTED 1.00]
- **Frontend ResumePage Components** — conv_resume_page_tsx, conv_loading_progress, conv_ats_score_bar, conv_try_parse_optimization_result, conv_optimize_mutation [EXTRACTED 1.00]

## Communities

### Community 0 - "Community 0"
Cohesion: 0.04
Nodes (86): AIRequestLog, AIRequestType, SQLAlchemy model for logging AI API requests per user.          Used for:, Convert model to dictionary., Enum for types of AI requests., Job, Convert job instance to dictionary., Job listing model representing a job posting with details,     location, compen (+78 more)

### Community 1 - "Community 1"
Cohesion: 0.07
Nodes (52): get_sqlalchemy_url(), Get SQLAlchemy database URL from settings.          Returns:         Database, Run migrations in 'offline' mode.          This configures the context with ju, Run migrations in 'online' mode.          In this scenario we need to create a, run_migrations_offline(), run_migrations_online(), Base, UserCertification (+44 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (49): build_docx(), build_pdf(), _docx_base(), _docx_t1(), _docx_t10(), _docx_t2(), _docx_t3(), _docx_t4() (+41 more)

### Community 3 - "Community 3"
Cohesion: 0.07
Nodes (27): AIService, Multi-turn interview preparation coach.         Asks interview questions and pr, Extract structured profile data from raw resume text., Service layer for AI-powered job assistant features using Claude API.     Handl, Fully rewrite a resume tailored to a specific job description.         Returns, Initialize AI service with Anthropic Claude client.          Args:, Generate a customized cover letter based on resume and job details.          A, Add message to conversation history for multi-turn context.          Args: (+19 more)

### Community 4 - "Community 4"
Cohesion: 0.11
Nodes (39): BaseModel, calculate_match_score(), generate_cover_letter(), improve_section(), optimize_resume(), Calculate how well a resume matches a specific job listing., Rewrite a single resume section to better match the target job description., Optimize resume text for a specific job using AI analysis. (+31 more)

### Community 5 - "Community 5"
Cohesion: 0.08
Nodes (30): can_use_template(), get_template(), get_templates_for_plan(), plan_from_string(), PlanTier, Plan definitions, template registry, and permission helpers for RoleGenie.  Si, Return template metadata by id, or None if not found.     Accepts both legacy ', Return True if the given plan is allowed to use this template.     Accepts both (+22 more)

### Community 6 - "Community 6"
Cohesion: 0.14
Nodes (36): handleSubmit(), change_password(), forgot_password(), ForgotPasswordRequest, get_me(), login(), Return the currently authenticated user's profile., Update the currently authenticated user's profile. (+28 more)

### Community 7 - "Community 7"
Cohesion: 0.07
Nodes (37): app/services/ai_service.py, analyze_resume_job_fit() - Stage 1 AI Pipeline, Anthropic Python SDK, ATSScoreBar Component, ATS Score Improvement Result (48 to 78), _build_docx() Helper Function, _build_pdf() Helper Function, /download/docx Endpoint (+29 more)

### Community 8 - "Community 8"
Cohesion: 0.19
Nodes (17): benchmark_pair(), count_tokens(), main(), print_table(), count_bullets(), extract_code_blocks(), extract_headings(), extract_paths() (+9 more)

### Community 9 - "Community 9"
Cohesion: 0.17
Nodes (16): main(), print_usage(), build_compress_prompt(), build_fix_prompt(), call_claude(), compress_file(), detect_file_type(), _is_code_line() (+8 more)

### Community 10 - "Community 10"
Cohesion: 0.2
Nodes (16): buildResumeDownloadFallbackFilename(), downloadBlob(), extractBullets(), getFilenameFromContentDisposition(), handleCopyText(), handleDownload(), handleImproveSection(), handleOptimize() (+8 more)

### Community 11 - "Community 11"
Cohesion: 0.13
Nodes (3): auth_headers(), override_get_db(), setup_teardown()

### Community 12 - "Community 12"
Cohesion: 0.18
Nodes (10): drop_db(), get_db(), get_engine(), init_db(), Enable foreign key support for SQLite.     This event listener runs on each dat, Dependency function to get a database session.     Yields a Session instance an, Initialize the database by creating all tables.     Call this once at applicati, Drop all tables from the database.     Use with caution - this is typically onl (+2 more)

### Community 13 - "Community 13"
Cohesion: 0.18
Nodes (6): RateLimiter, Log an AI API request to the database.          Args:             user_id: ID, Rate limiter for AI API calls using database log counts.          Enforces lim, Get comprehensive usage statistics for a user.          Args:             use, Initialize rate limiter with configurable limits.          Args:, Check if user has exceeded rate limits.          Args:             user_id: I

### Community 14 - "Community 14"
Cohesion: 0.18
Nodes (10): get_experience_level_analysis_prompt(), get_improvement_suggestions_prompt(), get_keyword_extraction_prompt(), get_match_score_analysis_prompt(), get_skills_deep_dive_prompt(), Generate prompt for detailed skills analysis and proficiency assessment., Generate prompt for experience level and seniority assessment.          Evalua, Generate prompt for comprehensive job-resume match analysis.          Analyzes (+2 more)

### Community 15 - "Community 15"
Cohesion: 0.22
Nodes (4): handleChange(), applyThemeToDocument(), getSystemTheme(), resolveThemeMode()

### Community 16 - "Community 16"
Cohesion: 0.2
Nodes (4): BaseSettings, Config, Application settings loaded from environment variables with type validation., Settings

### Community 17 - "Community 17"
Cohesion: 0.2
Nodes (2): Collection of prompt templates for resume optimization using Claude API.     Pr, ResumePrompts

### Community 18 - "Community 18"
Cohesion: 0.22
Nodes (2): CoverLetterPrompts, Collection of prompt templates for cover letter generation using Claude API.

### Community 19 - "Community 19"
Cohesion: 0.25
Nodes (3): getAnalyticsSessionId(), trackEvent(), switchMode()

### Community 20 - "Community 20"
Cohesion: 0.25
Nodes (6): health(), lifespan(), Lifespan context manager — handles startup/shutdown., Root endpoint — API health check., Health check endpoint., root()

### Community 21 - "Community 21"
Cohesion: 0.48
Nodes (4): _get_or_create_oauth_user(), github_callback(), google_callback(), _make_token_response()

### Community 23 - "Community 23"
Cohesion: 0.33
Nodes (5): downgrade(), Add job fields: category, skills, salary, experience_level.  Revision ID: 002, Add new columns to jobs table., Remove added columns from jobs table., upgrade()

### Community 24 - "Community 24"
Cohesion: 0.33
Nodes (5): downgrade(), Add ai_request_log table for tracking AI API requests.  Revision ID: 003 Revi, Create ai_request_logs table., Drop ai_request_logs table., upgrade()

### Community 26 - "Community 26"
Cohesion: 0.5
Nodes (1): Add profile tables and user profile columns.  Revision ID: 004 Revises: 003

### Community 27 - "Community 27"
Cohesion: 0.5
Nodes (1): Add is_admin column to users table.  Revision ID: 005 Revises: 004 Create Da

### Community 28 - "Community 28"
Cohesion: 0.5
Nodes (3): get_template_config(), Resume template configuration — Python source of truth for PDF/DOCX generation., Return the config dict for a slug ID, or the default if not found.

### Community 49 - "Community 49"
Cohesion: 1.0
Nodes (1): Caveman compress scripts.  This package provides tools to compress natural lan

### Community 51 - "Community 51"
Cohesion: 1.0
Nodes (1): Parse comma-separated string of origins into list.

### Community 52 - "Community 52"
Cohesion: 1.0
Nodes (1): Validate that app_env is one of allowed values.

### Community 53 - "Community 53"
Cohesion: 1.0
Nodes (1): Validate that log_level is a valid logging level.

### Community 54 - "Community 54"
Cohesion: 1.0
Nodes (1): Check if running in production environment.

### Community 55 - "Community 55"
Cohesion: 1.0
Nodes (1): Check if running in development environment.

### Community 58 - "Community 58"
Cohesion: 1.0
Nodes (1): Calculate total tokens used for this request.

### Community 59 - "Community 59"
Cohesion: 1.0
Nodes (1): Check if request was successful.

### Community 60 - "Community 60"
Cohesion: 1.0
Nodes (1): Calculate duration in seconds.

### Community 62 - "Community 62"
Cohesion: 1.0
Nodes (1): Generate prompt for cover letter creation tailored to specific job.          A

### Community 63 - "Community 63"
Cohesion: 1.0
Nodes (1): Generate prompt for customizing an existing cover letter.          Args:

### Community 64 - "Community 64"
Cohesion: 1.0
Nodes (1): Generate prompt for adjusting the tone of a cover letter.          Args:

### Community 65 - "Community 65"
Cohesion: 1.0
Nodes (1): Generate prompt for analyzing and scoring cover letter effectiveness.

### Community 66 - "Community 66"
Cohesion: 1.0
Nodes (1): Generate prompt for cover letter addressing career transition.          Args:

### Community 67 - "Community 67"
Cohesion: 1.0
Nodes (1): Generate prompt for creating multiple cover letters in one request.          A

### Community 68 - "Community 68"
Cohesion: 1.0
Nodes (1): Generate prompt for ATS keyword injection and optimization.          Args:

### Community 69 - "Community 69"
Cohesion: 1.0
Nodes (1): Generate prompt for analyzing skill alignment with job requirements.

### Community 70 - "Community 70"
Cohesion: 1.0
Nodes (1): Generate prompt for general resume content and structure improvements.

### Community 71 - "Community 71"
Cohesion: 1.0
Nodes (1): Generate prompt for tailored cover letter generation.          Args:

### Community 72 - "Community 72"
Cohesion: 1.0
Nodes (1): Generate prompt for resume formatting and visual presentation analysis.

### Community 73 - "Community 73"
Cohesion: 1.0
Nodes (1): Generate prompt for identifying and enhancing most relevant experiences.

### Community 74 - "Community 74"
Cohesion: 1.0
Nodes (1): Generate prompt for quick, general resume feedback.          Args:

## Knowledge Gaps
- **151 isolated node(s):** `Add job fields: category, skills, salary, experience_level.  Revision ID: 002`, `Add new columns to jobs table.`, `Remove added columns from jobs table.`, `Add ai_request_log table for tracking AI API requests.  Revision ID: 003 Revi`, `Create ai_request_logs table.` (+146 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 17`** (10 nodes): `resume_prompts.py`, `get_ats_optimization_prompt()`, `get_content_improvement_prompt()`, `get_cover_letter_prompt()`, `get_experience_highlight_prompt()`, `get_formatting_check_prompt()`, `get_quick_feedback_prompt()`, `get_skill_alignment_prompt()`, `Collection of prompt templates for resume optimization using Claude API.     Pr`, `ResumePrompts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 18`** (9 nodes): `cover_letter_prompts.py`, `CoverLetterPrompts`, `get_cover_letter_batch_generation_prompt()`, `get_cover_letter_customization_prompt()`, `get_cover_letter_for_career_change_prompt()`, `get_cover_letter_generation_prompt()`, `get_cover_letter_strength_analysis_prompt()`, `get_cover_letter_tone_adjustment_prompt()`, `Collection of prompt templates for cover letter generation using Claude API.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (4 nodes): `004_add_profile_tables.py`, `downgrade()`, `Add profile tables and user profile columns.  Revision ID: 004 Revises: 003`, `upgrade()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (4 nodes): `005_add_is_admin.py`, `downgrade()`, `Add is_admin column to users table.  Revision ID: 005 Revises: 004 Create Da`, `upgrade()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 49`** (2 nodes): `Caveman compress scripts.  This package provides tools to compress natural lan`, `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 51`** (1 nodes): `Parse comma-separated string of origins into list.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 52`** (1 nodes): `Validate that app_env is one of allowed values.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 53`** (1 nodes): `Validate that log_level is a valid logging level.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 54`** (1 nodes): `Check if running in production environment.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 55`** (1 nodes): `Check if running in development environment.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 58`** (1 nodes): `Calculate total tokens used for this request.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 59`** (1 nodes): `Check if request was successful.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 60`** (1 nodes): `Calculate duration in seconds.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 62`** (1 nodes): `Generate prompt for cover letter creation tailored to specific job.          A`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 63`** (1 nodes): `Generate prompt for customizing an existing cover letter.          Args:`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 64`** (1 nodes): `Generate prompt for adjusting the tone of a cover letter.          Args:`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 65`** (1 nodes): `Generate prompt for analyzing and scoring cover letter effectiveness.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 66`** (1 nodes): `Generate prompt for cover letter addressing career transition.          Args:`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 67`** (1 nodes): `Generate prompt for creating multiple cover letters in one request.          A`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 68`** (1 nodes): `Generate prompt for ATS keyword injection and optimization.          Args:`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 69`** (1 nodes): `Generate prompt for analyzing skill alignment with job requirements.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 70`** (1 nodes): `Generate prompt for general resume content and structure improvements.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 71`** (1 nodes): `Generate prompt for tailored cover letter generation.          Args:`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 72`** (1 nodes): `Generate prompt for resume formatting and visual presentation analysis.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 73`** (1 nodes): `Generate prompt for identifying and enhancing most relevant experiences.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 74`** (1 nodes): `Generate prompt for quick, general resume feedback.          Args:`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `User` connect `Community 0` to `Community 1`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 21`?**
  _High betweenness centrality (0.155) - this node is a cross-community bridge._
- **Why does `AIService` connect `Community 3` to `Community 1`, `Community 4`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Why does `Save AI-parsed resume data into all profile tables.` connect `Community 1` to `Community 0`, `Community 3`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Are the 96 inferred relationships involving `User` (e.g. with `Get SQLAlchemy database URL from settings.          Returns:         Database` and `Run migrations in 'offline' mode.          This configures the context with ju`) actually correct?**
  _`User` has 96 INFERRED edges - model-reasoned connections that need verification._
- **Are the 67 inferred relationships involving `AuthService` (e.g. with `ForgotPasswordRequest` and `ResetPasswordRequest`) actually correct?**
  _`AuthService` has 67 INFERRED edges - model-reasoned connections that need verification._
- **Are the 41 inferred relationships involving `Job` (e.g. with `Get SQLAlchemy database URL from settings.          Returns:         Database` and `Run migrations in 'offline' mode.          This configures the context with ju`) actually correct?**
  _`Job` has 41 INFERRED edges - model-reasoned connections that need verification._
- **Are the 28 inferred relationships involving `AIRequestLog` (e.g. with `RateLimiter` and `Rate limiter for AI API calls using database log counts.          Enforces lim`) actually correct?**
  _`AIRequestLog` has 28 INFERRED edges - model-reasoned connections that need verification._