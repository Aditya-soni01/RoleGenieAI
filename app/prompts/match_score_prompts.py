app/prompts/match_score_prompts.py
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)


class MatchScorePrompts:
    """
    Collection of prompt templates for job-resume match scoring.
    Provides structured prompts for analyzing compatibility between
    job descriptions and resumes with detailed breakdown by skills,
    experience, and keywords.
    """

    @staticmethod
    def get_match_score_analysis_prompt(
        resume_text: str,
        job_title: str,
        job_description: str,
        company_name: str,
        required_skills: List[str],
    ) -> str:
        """
        Generate prompt for comprehensive job-resume match analysis.

        Analyzes resume against job requirements and returns a detailed
        score breakdown across multiple dimensions: technical skills,
        experience level, keyword alignment, and cultural fit indicators.

        Args:
            resume_text: Full resume content
            job_title: Target position title
            job_description: Complete job description
            company_name: Company name
            required_skills: List of required skills from job posting

        Returns:
            Formatted prompt for Claude API
        """
        return f"""You are an expert HR recruiter and career counselor with 20+ years of experience in talent acquisition.

Your task is to analyze the match between a candidate's resume and a job posting. Provide a detailed match analysis with numerical scores and actionable insights.

=== CANDIDATE RESUME ===
{resume_text}

=== JOB POSTING DETAILS ===
Company: {company_name}
Position: {job_title}

Description:
{job_description}

Required Skills: {', '.join(required_skills)}

=== ANALYSIS REQUIREMENTS ===
Analyze the resume against the job requirements and provide:

1. **Overall Match Score** (0-100): Overall suitability for the role
2. **Skills Match Score** (0-100): How well resume skills align with required skills
3. **Experience Match Score** (0-100): Relevance and depth of experience for the role
4. **Keyword Alignment Score** (0-100): How many key terms/technologies from job description are present in resume
5. **Cultural Fit Assessment** (0-100): Based on company type, growth trajectory, and candidate background

For each score, provide:
- The numerical score
- 2-3 key reasons supporting the score
- Specific evidence from the resume

Also identify:
- **Top 5 Matching Skills**: Skills candidate has that are needed
- **Gap Areas**: Required skills not evident in resume
- **Strengths**: Unique qualifications that stand out
- **Development Opportunities**: Skills to develop for better fit
- **Key Achievements Match**: Relevant accomplishments that demonstrate capability

=== OUTPUT FORMAT ===
Respond in valid JSON format with the following structure:
{{
  "overall_match_score": <number 0-100>,
  "overall_match_reasoning": "<2-3 sentence explanation>",
  "skills_match_score": <number 0-100>,
  "skills_match_reasoning": "<explanation>",
  "skills_match_evidence": ["<evidence 1>", "<evidence 2>", "<evidence 3>"],
  "experience_match_score": <number 0-100>,
  "experience_match_reasoning": "<explanation>",
  "experience_match_evidence": ["<evidence 1>", "<evidence 2>", "<evidence 3>"],
  "keyword_alignment_score": <number 0-100>,
  "keyword_alignment_reasoning": "<explanation>",
  "matched_keywords": ["<keyword 1>", "<keyword 2>", ...],
  "missing_keywords": ["<keyword 1>", "<keyword 2>", ...],
  "cultural_fit_score": <number 0-100>,
  "cultural_fit_reasoning": "<explanation>",
  "cultural_fit_evidence": ["<evidence 1>", "<evidence 2>", "<evidence 3>"],
  "top_matching_skills": ["<skill 1>", "<skill 2>", "<skill 3>", "<skill 4>", "<skill 5>"],
  "gap_areas": ["<skill 1>", "<skill 2>", "<skill 3>"],
  "strengths": "<3-4 sentence summary of unique qualifications>",
  "development_opportunities": "<3-4 sentence summary of areas for growth>",
  "key_achievements_match": ["<achievement 1>", "<achievement 2>", "<achievement 3>"],
  "recommendation": "<Should apply/Strong candidate/Moderate fit/Stretch role based on analysis>",
  "next_steps": ["<action 1>", "<action 2>", "<action 3>"]
}}

Be thorough but concise. Focus on factual alignment. Use the scoring scale:
- 90-100: Excellent alignment
- 75-89: Strong alignment
- 60-74: Moderate alignment
- 45-59: Below average alignment
- Below 45: Poor alignment
"""

    @staticmethod
    def get_skills_deep_dive_prompt(
        resume_text: str,
        required_skills: List[str],
        job_context: str,
    ) -> str:
        """
        Generate prompt for detailed skills analysis and proficiency assessment.

        Evaluates each required skill in detail, assesses proficiency levels,
        and provides recommendations for skill enhancement.

        Args:
            resume_text: Full resume content
            required_skills: List of skills to analyze
            job_context: Context about the role and industry

        Returns:
            Formatted prompt for Claude API
        """
        skills_list = "\n".join([f"- {skill}" for skill in required_skills])

        return f"""You are a technical skills assessor and learning strategist.

Analyze the candidate's resume for proficiency in these required skills:

{skills_list}

=== CANDIDATE RESUME ===
{resume_text}

=== JOB CONTEXT ===
{job_context}

=== DETAILED ANALYSIS ===
For each required skill, determine:

1. **Proficiency Level** (None, Beginner, Intermediate, Advanced, Expert):
   - Based on explicit mentions, years of experience, and context clues
   
2. **Evidence**: Specific resume lines supporting the assessment
3. **Gap Analysis**: How this proficiency level compares to job requirements
4. **Improvement Path**: Concrete steps to reach required proficiency (if gap exists)

=== OUTPUT FORMAT ===
Respond in valid JSON:
{{
  "skill_assessments": [
    {{
      "skill_name": "<skill>",
      "proficiency_level": "<None|Beginner|Intermediate|Advanced|Expert>",
      "confidence": <0-100>,
      "evidence": ["<line 1>", "<line 2>"],
      "meets_requirement": <true|false>,
      "improvement_path": "<steps to reach requirement if applicable>",
      "estimated_time_to_proficiency": "<timeframe>"
    }}
  ],
  "skill_gap_summary": "<overview of skill gaps>",
  "priority_skills_to_develop": ["<skill 1>", "<skill 2>", "<skill 3>"],
  "strengths_to_leverage": ["<skill 1>", "<skill 2>"]
}}
"""

    @staticmethod
    def get_experience_level_analysis_prompt(
        resume_text: str,
        required_experience_years: int,
        required_experience_description: str,
        job_title: str,
    ) -> str:
        """
        Generate prompt for experience level and seniority assessment.

        Evaluates career trajectory, relevant experience, and seniority level
        alignment with the job requirements.

        Args:
            resume_text: Full resume content
            required_experience_years: Minimum years of experience required
            required_experience_description: Description of experience type needed
            job_title: Target job title

        Returns:
            Formatted prompt for Claude API
        """
        return f"""You are a career development expert specializing in experience assessment.

=== CANDIDATE RESUME ===
{resume_text}

=== EXPERIENCE REQUIREMENTS ===
Position: {job_title}
Required Years: {required_experience_years}+
Experience Type: {required_experience_description}

=== ASSESSMENT TASK ===
Analyze the candidate's career history and determine:

1. **Total Years of Experience**: Calculate total professional experience
2. **Relevant Experience Years**: Years specifically relevant to the position
3. **Career Trajectory**: Growth pattern and progression
4. **Seniority Level Assessment**: Junior, Mid-level, Senior, Lead, Executive
5. **Experience-to-Role Fit**: How experience aligns with job requirements
6. **Role Progression Readiness**: Can they advance into this role from current level?

=== OUTPUT FORMAT ===
Respond in valid JSON:
{{
  "total_years_experience": <number>,
  "relevant_years_experience": <number>,
  "seniority_level": "<Junior|Mid-Level|Senior|Lead|Executive>",
  "career_trajectory_assessment": "<assessment of growth and progression>",
  "meets_minimum_requirement": <true|false>,
  "requirement_gap": "<explanation if doesn't meet requirement>",
  "key_roles": ["<role 1>", "<role 2>", "<role 3>"],
  "industry_experience": "<industries candidate has worked in>",
  "company_size_experience": ["<size 1>", "<size 2>"],
  "transferable_experience": ["<experience 1>", "<experience 2>", "<experience 3>"],
  "readiness_assessment": "<detailed assessment of readiness for this specific role>",
  "career_growth_potential": "<assessment of potential to grow into role>"
}}
"""

    @staticmethod
    def get_keyword_extraction_prompt(
        job_description: str,
    ) -> str:
        """
        Generate prompt for extracting critical keywords and competencies from job description.

        Identifies technical skills, soft skills, industry keywords, tools,
        certifications, and other critical terms from the job posting.

        Args:
            job_description: Complete job description text

        Returns:
            Formatted prompt for Claude API
        """
        return f"""You are a job market analyst and skills taxonomy expert.

=== JOB DESCRIPTION ===
{job_description}

=== EXTRACTION TASK ===
Extract and categorize all critical keywords and competencies from this job posting.

Identify and list:

1. **Technical Skills**: Programming languages, frameworks, tools, platforms
2. **Soft Skills**: Communication, leadership, collaboration, problem-solving
3. **Domain Expertise**: Industry-specific knowledge and terminology
4. **Tools & Technologies**: Software, platforms, applications mentioned
5. **Certifications**: Any required or desired certifications
6. **Experience Keywords**: Specific experience types, methodologies, practices
7. **Buzzwords/Jargon**: Commonly used phrases in the job description
8. **Education Requirements**: Degrees, fields of study mentioned

=== OUTPUT FORMAT ===
Respond in valid JSON:
{{
  "technical_skills": ["<skill 1>", "<skill 2>", ...],
  "soft_skills": ["<skill 1>", "<skill 2>", ...],
  "domain_expertise": ["<expertise 1>", "<expertise 2>", ...],
  "tools_and_technologies": ["<tool 1>", "<tool 2>", ...],
  "certifications": ["<cert 1>", "<cert 2>", ...],
  "experience_keywords": ["<keyword 1>", "<keyword 2>", ...],
  "industry_buzzwords": ["<buzzword 1>", "<buzzword 2>", ...],
  "education_requirements": ["<requirement 1>", "<requirement 2>", ...],
  "criticality_ranking": {{
    "must_have": ["<item 1>", "<item 2>"],
    "strongly_desired": ["<item 1>", "<item 2>"],
    "nice_to_have": ["<item 1>", "<item 2>"]
  }},
  "role_focus_areas": ["<area 1>", "<area 2>", "<area 3>"]
}}
"""

    @staticmethod
    def get_improvement_suggestions_prompt(
        resume_text: str,
        job_description: str,
        match_score: int,
        gap_areas: List[str],
    ) -> str:
        """
        Generate prompt for creating actionable improvement suggestions.

        Provides specific, prioritized recommendations for resume enhancement
        and skill development to increase match score.

        Args:
            resume_text: Current resume content
            job_description: Target job description
            match_score: Current match score (0-100)
            gap_areas: List of identified skill gaps

        Returns:
            Formatted prompt for Claude API
        """
        gaps = "\n".join([f"- {gap}" for gap in gap_areas])

        return f"""You are a career coach specializing in job application optimization.

=== CANDIDATE PROFILE ===
Current Match Score: {match_score}/100
Resume:
{resume_text}

=== TARGET JOB ===
{job_description}

=== IDENTIFIED GAPS ===
{gaps}

=== IMPROVEMENT TASK ===
Create a prioritized action plan to improve the candidate's fit for this role.

For each recommendation, provide:
1. **Priority**: High, Medium, Low
2. **Action**: Specific, actionable step
3. **Impact**: Expected improvement to match score
4. **Timeline**: Realistic timeframe (immediate, 1-3 months, 3-6 months, 6+ months)
5. **Resources**: Where to find learning materials or opportunities
6. **Measurable Outcome**: How to demonstrate improvement

Focus on:
- Quick wins (skills to highlight in current resume)
- Short-term improvements (skills to develop in 1-3 months)
- Long-term career development (6+ month investments)

=== OUTPUT FORMAT ===
Respond in valid JSON:
{{
  "quick_wins": [
    {{
      "action": "<resume enhancement or existing skill to highlight>",
      "impact_score_increase": <number>,
      "implementation_time": "<timeframe>",
      "specific_suggestion": "<detailed instruction>"
    }}
  ],
  "short_term_improvements": [
    {{
      "skill": "<skill to develop>",
      "current_level": "<current proficiency>",
      "target_level": "<desired proficiency>",
      "timeframe": "<1-3 months typical>",
      "learning_path": ["<resource 1>", "<resource 2>", "<resource 3>"],
      "impact_score_increase": <number>,
      "verification_method": "<how to demonstrate>"
    }}
  ],
  "long_term_development": [
    {{
      "area": "<area for growth>",
      "timeframe": "<6+ months>",
      "rationale": "<why this matters for career>",
      "path": "<detailed development path>",
      "career_impact": "<long-term benefits>"
    }}
  ],
  "resume_optimization_tips": ["<tip 1>", "<tip 2>", "<tip 3>"],
  "interview_preparation_focus": ["<topic 1>", "<topic 2>", "<topic 3>"],
  "overall_readiness_timeline": "<timeframe to be strong candidate>"
}}
"""

    @staticmethod
    def get_comparative_analysis_prompt(
        resume_text: str,
        job_description: str,
        candidate_background: str,
    ) -> str:
        """
        Generate prompt for comparative analysis against typical candidate profiles.

        Positions candidate against typical backgrounds for the role,
        identifies unique differentiators, and highlights competitive advantages.

        Args:
            resume_text: Candidate resume content
            job_description: Target job description
            candidate_background: Brief description of candidate's background

        Returns:
            Formatted prompt for Claude API
        """
        return f"""You are a talent acquisition strategist with deep industry knowledge.

=== CANDIDATE PROFILE ===
{candidate_background}

Resume:
{resume_text}

=== TARGET JOB ===
{job_description}

=== ANALYSIS TASK ===
Conduct a comparative analysis positioning this candidate against:
1. Typical candidates for this role
2. Ideal candidate profile
3. Common backgrounds that succeed in this role
4. Market competitive landscape

Identify:
- Unique differentiators
- Competitive