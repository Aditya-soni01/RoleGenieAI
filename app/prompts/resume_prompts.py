from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)


class ResumePrompts:
    """
    Collection of prompt templates for resume optimization using Claude API.
    Provides structured prompts for ATS keyword injection, skill alignment,
    and formatting suggestions.
    """

    @staticmethod
    def get_ats_optimization_prompt(
        resume_text: str,
        job_description: str,
        job_title: str
    ) -> str:
        """
        Generate prompt for ATS keyword injection and optimization.

        Args:
            resume_text: Full resume content
            job_description: Target job description
            job_title: Target job title

        Returns:
            Formatted prompt for Claude API
        """
        return f"""You are an expert resume writer specializing in ATS (Applicant Tracking System) optimization.

Analyze the following resume and job description. Your task is to:
1. Identify missing high-value keywords from the job description
2. Suggest where to inject these keywords naturally
3. Improve formatting for ATS readability
4. Maintain authenticity - only add skills/experience that are true

TARGET JOB TITLE: {job_title}

JOB DESCRIPTION:
{job_description}

CURRENT RESUME:
{resume_text}

Provide your response in the following JSON format:
{{
    "missing_keywords": ["keyword1", "keyword2", ...],
    "keyword_suggestions": [
        {{
            "section": "section_name",
            "original_text": "original line",
            "suggested_text": "improved line with keywords"
        }}
    ],
    "ats_formatting_tips": ["tip1", "tip2", ...],
    "overall_score": 0-100,
    "score_explanation": "why this score"
}}

Return ONLY valid JSON, no additional text."""

    @staticmethod
    def get_skill_alignment_prompt(
        resume_text: str,
        job_description: str
    ) -> str:
        """
        Generate prompt for analyzing skill alignment with job requirements.

        Args:
            resume_text: Full resume content
            job_description: Target job description

        Returns:
            Formatted prompt for Claude API
        """
        return f"""You are a career advisor analyzing resume-to-job fit based on skills.

Compare the skills in the provided resume against the job description requirements.

JOB DESCRIPTION:
{job_description}

RESUME:
{resume_text}

Analyze and provide:
1. Required skills mentioned in job description
2. Skills from resume that match job requirements
3. Skills from resume that are valuable but not mentioned
4. Critical missing skills
5. Recommendations to bridge skill gaps

Provide your response in the following JSON format:
{{
    "required_skills": ["skill1", "skill2", ...],
    "matched_skills": ["skill1", "skill2", ...],
    "additional_strengths": ["skill1", "skill2", ...],
    "missing_critical_skills": ["skill1", "skill2", ...],
    "skill_alignment_percentage": 0-100,
    "recommendations": [
        {{
            "missing_skill": "skill_name",
            "how_to_address": "suggestion"
        }}
    ]
}}

Return ONLY valid JSON, no additional text."""

    @staticmethod
    def get_content_improvement_prompt(
        resume_text: str,
        job_title: str
    ) -> str:
        """
        Generate prompt for general resume content and structure improvements.

        Args:
            resume_text: Full resume content
            job_title: Target job title for context

        Returns:
            Formatted prompt for Claude API
        """
        return f"""You are an expert resume editor specializing in high-impact content for {job_title} positions.

Review this resume and suggest concrete improvements:

RESUME:
{resume_text}

Provide suggestions in these areas:
1. Professional summary effectiveness
2. Action verb usage (replace weak verbs with strong ones)
3. Achievement metrics (quantify impact)
4. Relevance to target role: {job_title}
5. Overall readability and flow

Provide your response in the following JSON format:
{{
    "sections": [
        {{
            "section_name": "section",
            "current_strength": "what works well",
            "improvement_areas": ["area1", "area2"],
            "specific_suggestions": [
                {{
                    "current": "current text",
                    "suggested": "improved text",
                    "reason": "why this is better"
                }}
            ]
        }}
    ],
    "action_verbs_to_replace": [
        {{
            "weak_verb": "verb",
            "strong_alternatives": ["verb1", "verb2"]
        }}
    ],
    "metrics_to_add": [
        {{
            "statement": "statement to quantify",
            "suggestion": "how to add metrics"
        }}
    ],
    "overall_improvement_priority": ["highest", "high", "medium"]
}}

Return ONLY valid JSON, no additional text."""

    @staticmethod
    def get_cover_letter_prompt(
        resume_text: str,
        job_description: str,
        job_title: str,
        company_name: str
    ) -> str:
        """
        Generate prompt for tailored cover letter generation.

        Args:
            resume_text: Resume content for context
            job_description: Target job description
            job_title: Target job title
            company_name: Target company name

        Returns:
            Formatted prompt for Claude API
        """
        return f"""You are an expert cover letter writer. Generate a compelling cover letter that bridges the resume to the specific job opportunity.

RESUME BACKGROUND:
{resume_text}

JOB TITLE: {job_title}
COMPANY: {company_name}

JOB DESCRIPTION:
{job_description}

Write a professional cover letter (3-4 paragraphs) that:
1. Opens with enthusiasm for the role and company
2. Highlights 2-3 key experiences that directly match job requirements
3. Shows understanding of the company and role
4. Closes with a strong call to action
5. Maintains professional yet personable tone

Provide your response in the following JSON format:
{{
    "cover_letter": "full cover letter text",
    "key_highlights": ["highlight1", "highlight2", "highlight3"],
    "tone_assessment": "professional/personable/confident",
    "tips_for_personalization": ["tip1", "tip2"]
}}

Return ONLY valid JSON, no additional text."""

    @staticmethod
    def get_formatting_check_prompt(
        resume_text: str
    ) -> str:
        """
        Generate prompt for resume formatting and visual presentation analysis.

        Args:
            resume_text: Full resume content

        Returns:
            Formatted prompt for Claude API
        """
        return f"""You are an expert in resume formatting and visual presentation optimization.

Analyze this resume for formatting effectiveness:

RESUME:
{resume_text}

Evaluate:
1. Section organization and logical flow
2. Consistency in formatting (dates, bullets, spacing)
3. Appropriate use of bold, italics, and formatting
4. Length considerations (length vs. content density)
5. Readability for both humans and ATS systems
6. Common formatting mistakes

Provide your response in the following JSON format:
{{
    "formatting_score": 0-100,
    "organization": {{
        "current_flow": "description",
        "recommendations": ["rec1", "rec2"]
    }},
    "consistency_issues": [
        {{
            "issue": "description",
            "location": "where in resume",
            "fix": "how to fix"
        }}
    ],
    "ats_compliance": {{
        "compliant": true/false,
        "issues": ["issue1", "issue2"],
        "fixes": ["fix1", "fix2"]
    }},
    "readability": {{
        "strengths": ["strength1", "strength2"],
        "improvements": ["improvement1", "improvement2"]
    }},
    "ideal_length": "X pages for this career level",
    "actionable_fixes": [
        {{
            "priority": "high/medium/low",
            "fix": "specific action to take"
        }}
    ]
}}

Return ONLY valid JSON, no additional text."""

    @staticmethod
    def get_experience_highlight_prompt(
        resume_text: str,
        job_description: str
    ) -> str:
        """
        Generate prompt for identifying and enhancing most relevant experiences.

        Args:
            resume_text: Full resume content
            job_description: Target job description

        Returns:
            Formatted prompt for Claude API
        """
        return f"""You are a career strategist helping someone highlight relevant experience for a specific role.

RESUME:
{resume_text}

TARGET JOB REQUIREMENTS:
{job_description}

Analyze the resume and:
1. Rank experiences by relevance to the target job
2. Identify transferable skills from seemingly unrelated roles
3. Suggest how to reframe experiences to emphasize job relevance
4. Identify gaps in experience and how to address them

Provide your response in the following JSON format:
{{
    "top_relevant_experiences": [
        {{
            "experience": "job/project title",
            "relevance_score": 0-100,
            "why_relevant": "explanation",
            "how_to_emphasize": "suggestion"
        }}
    ],
    "transferable_skills": [
        {{
            "skill": "skill name",
            "source_experience": "where from resume",
            "application_to_target": "how it applies"
        }}
    ],
    "experience_gaps": [
        {{
            "gap": "missing experience",
            "how_to_address": "workaround or alternative"
        }}
    ],
    "reframing_suggestions": [
        {{
            "current_phrasing": "what resume says",
            "suggested_phrasing": "more impactful version",
            "reason": "why this is better"
        }}
    ]
}}

Return ONLY valid JSON, no additional text."""

    @staticmethod
    def get_quick_feedback_prompt(
        resume_text: str
    ) -> str:
        """
        Generate prompt for quick, general resume feedback.

        Args:
            resume_text: Full resume content

        Returns:
            Formatted prompt for Claude API
        """
        return f"""You are a resume reviewer providing quick, actionable feedback.

RESUME:
{resume_text}

Provide brief feedback on:
1. Top 3 strengths of this resume
2. Top 3 areas needing improvement
3. Single biggest priority to address immediately
4. Overall impression (in 2-3 sentences)

Provide your response in the following JSON format:
{{
    "top_strengths": ["strength1", "strength2", "strength3"],
    "improvement_areas": ["area1", "area2", "area3"],
    "immediate_priority": {{
        "issue": "what to fix first",
        "why": "impact of fixing this",
        "how": "specific action"
    }},
    "overall_impression": "2-3 sentence summary",
    "estimated_effectiveness": "low/medium/high for attracting employers"
}}

Return ONLY valid JSON, no additional text."""
</s>