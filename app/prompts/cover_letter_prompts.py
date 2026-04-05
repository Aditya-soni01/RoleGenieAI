from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)


class CoverLetterPrompts:
    """
    Collection of prompt templates for cover letter generation using Claude API.
    Provides structured prompts for creating tailored cover letters based on
    job descriptions and user profiles.
    """

    @staticmethod
    def get_cover_letter_generation_prompt(
        user_name: str,
        user_title: str,
        user_summary: str,
        job_title: str,
        company_name: str,
        job_description: str,
        key_requirements: List[str],
    ) -> str:
        """
        Generate prompt for cover letter creation tailored to specific job.

        Args:
            user_name: Applicant's full name
            user_title: Applicant's current job title
            user_summary: Brief professional summary from resume
            job_title: Target job title
            company_name: Target company name
            job_description: Full job description
            key_requirements: List of key job requirements

        Returns:
            Formatted prompt for Claude API
        """
        requirements_text = "\n".join(
            [f"- {req}" for req in key_requirements]
        )

        return f"""You are an expert cover letter writer specializing in creating compelling, 
personalized cover letters that stand out to hiring managers and pass ATS screening.

Create a professional, engaging cover letter for the following candidate and position:

CANDIDATE INFORMATION:
Name: {user_name}
Current Title: {user_title}
Professional Summary: {user_summary}

POSITION DETAILS:
Job Title: {job_title}
Company: {company_name}

JOB DESCRIPTION:
{job_description}

KEY REQUIREMENTS:
{requirements_text}

INSTRUCTIONS:
1. Write a compelling opening paragraph that shows genuine interest in the specific role and company
2. Create 2-3 body paragraphs that:
   - Demonstrate how the candidate's experience aligns with job requirements
   - Highlight specific achievements and skills relevant to the position
   - Use keywords from the job description naturally
3. Include a strong closing paragraph with a call to action
4. Keep the tone professional but personable
5. Ensure the letter is concise (250-400 words)
6. Use proper business letter formatting
7. Make it feel authentic and specific to this particular job, not generic

Generate the cover letter now:"""

    @staticmethod
    def get_cover_letter_customization_prompt(
        base_cover_letter: str,
        customization_instruction: str,
    ) -> str:
        """
        Generate prompt for customizing an existing cover letter.

        Args:
            base_cover_letter: Original cover letter text
            customization_instruction: User's customization request

        Returns:
            Formatted prompt for Claude API
        """
        return f"""You are an expert cover letter editor. Revise the following cover letter 
based on the specific instruction provided.

ORIGINAL COVER LETTER:
{base_cover_letter}

CUSTOMIZATION INSTRUCTION:
{customization_instruction}

INSTRUCTIONS:
1. Apply the requested customization while maintaining professional quality
2. Keep the overall structure and tone consistent
3. Ensure the revised letter still aligns with the original job requirements
4. Do not make the letter longer unless specifically requested
5. Maintain authenticity and personalization
6. Fix any grammar or spelling issues if found

Provide only the revised cover letter without additional commentary:"""

    @staticmethod
    def get_cover_letter_tone_adjustment_prompt(
        cover_letter: str,
        target_tone: str,
    ) -> str:
        """
        Generate prompt for adjusting the tone of a cover letter.

        Args:
            cover_letter: Original cover letter text
            target_tone: Desired tone (e.g., 'more confident', 'more humble', 'more energetic')

        Returns:
            Formatted prompt for Claude API
        """
        return f"""You are an expert cover letter writer. Adjust the tone of the following 
cover letter to be {target_tone}.

ORIGINAL COVER LETTER:
{cover_letter}

INSTRUCTIONS:
1. Rewrite the cover letter with a {target_tone} tone
2. Maintain all original information and structure
3. Ensure the letter remains professional and appropriate for business communication
4. Preserve the candidate's authentic voice while adjusting tone
5. Keep the same length approximately

Provide only the revised cover letter without additional commentary:"""

    @staticmethod
    def get_cover_letter_strength_analysis_prompt(
        cover_letter: str,
        job_description: str,
    ) -> str:
        """
        Generate prompt for analyzing and scoring cover letter effectiveness.

        Args:
            cover_letter: Cover letter text to analyze
            job_description: Target job description for comparison

        Returns:
            Formatted prompt for Claude API
        """
        return f"""You are an expert hiring manager and cover letter consultant. 
Analyze the effectiveness of the following cover letter for the given job.

COVER LETTER:
{cover_letter}

JOB DESCRIPTION:
{job_description}

ANALYSIS INSTRUCTIONS:
1. Score the cover letter on a scale of 1-10 for each criterion:
   - Alignment with job requirements (1-10)
   - Professional tone and writing quality (1-10)
   - Personalization and specificity (1-10)
   - ATS keyword optimization (1-10)
   - Compelling narrative and engagement (1-10)
2. Provide overall score (1-10)
3. Identify 3-5 key strengths
4. Identify 3-5 areas for improvement
5. Provide specific, actionable recommendations for enhancement

Format your response as JSON with the following structure:
{{
    "alignment_score": <number>,
    "tone_score": <number>,
    "personalization_score": <number>,
    "ats_score": <number>,
    "engagement_score": <number>,
    "overall_score": <number>,
    "strengths": ["<strength1>", "<strength2>", ...],
    "improvements": ["<improvement1>", "<improvement2>", ...],
    "recommendations": "<detailed recommendations as string>"
}}"""

    @staticmethod
    def get_cover_letter_for_career_change_prompt(
        user_name: str,
        previous_title: str,
        target_title: str,
        transferable_skills: List[str],
        motivations: str,
        company_name: str,
        job_description: str,
    ) -> str:
        """
        Generate prompt for cover letter addressing career transition.

        Args:
            user_name: Applicant's full name
            previous_title: Current/previous job title
            target_title: Target job title (career change)
            transferable_skills: List of skills transferable to new role
            motivations: Why the candidate wants to change careers
            company_name: Target company name
            job_description: Full job description

        Returns:
            Formatted prompt for Claude API
        """
        skills_text = "\n".join([f"- {skill}" for skill in transferable_skills])

        return f"""You are an expert cover letter writer specializing in career transitions. 
Create a compelling cover letter that addresses a career change professionally and positively.

CANDIDATE INFORMATION:
Name: {user_name}
Current Title: {previous_title}
Target Title: {target_title}
Career Change Motivation: {motivations}

TRANSFERABLE SKILLS:
{skills_text}

POSITION DETAILS:
Company: {company_name}
Job Description:
{job_description}

INSTRUCTIONS FOR CAREER CHANGE COVER LETTER:
1. Open with a clear statement of intent and enthusiasm for the new direction
2. Acknowledge the career transition directly and frame it positively
3. Emphasize how previous experience translates to the new role
4. Highlight specific transferable skills relevant to the position
5. Demonstrate knowledge of the new industry/role
6. Address potential concerns about the career change proactively
7. Show genuine passion for the new opportunity
8. Maintain professional tone while showing personality
9. Keep the letter concise (250-400 words)
10. Make the candidate memorable despite the non-traditional background

Generate the career change cover letter now:"""

    @staticmethod
    def get_cover_letter_batch_generation_prompt(
        user_name: str,
        user_title: str,
        user_summary: str,
        jobs: List[Dict[str, Any]],
    ) -> str:
        """
        Generate prompt for creating multiple cover letters in one request.

        Args:
            user_name: Applicant's full name
            user_title: Applicant's current job title
            user_summary: Brief professional summary
            jobs: List of job dictionaries with keys: title, company, description, requirements

        Returns:
            Formatted prompt for Claude API
        """
        jobs_text = ""
        for idx, job in enumerate(jobs, 1):
            jobs_text += f"""
JOB {idx}:
Company: {job.get('company', 'N/A')}
Title: {job.get('title', 'N/A')}
Description: {job.get('description', 'N/A')}
Requirements: {', '.join(job.get('requirements', []))}
---"""

        return f"""You are an expert cover letter writer. Generate customized cover letters 
for the following candidate applying to multiple positions.

CANDIDATE INFORMATION:
Name: {user_name}
Current Title: {user_title}
Professional Summary: {user_summary}

POSITIONS:
{jobs_text}

INSTRUCTIONS:
1. Create a unique, tailored cover letter for EACH position
2. Each cover letter should:
   - Be specific to that company and role
   - Align with stated requirements
   - Use natural language (not formulaic)
   - Be 250-400 words
   - Include proper business letter formatting
3. Number each cover letter (JOB 1, JOB 2, etc.)
4. Ensure each feels authentic and personalized, not generic

Generate all cover letters now, clearly labeled and separated:"""