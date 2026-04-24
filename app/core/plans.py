"""
Plan definitions, template registry, and permission helpers for RoleGenie.

Single source of truth for:
- PlanTier enum (starter / job_seeker / interview_cracker)
- Template registry (10 templates with metadata)
- Access control helpers
"""

from enum import Enum
from typing import Any, Dict, List, Optional


class PlanTier(str, Enum):
    STARTER = "starter"
    JOB_SEEKER = "job_seeker"
    INTERVIEW_CRACKER = "interview_cracker"


# ─── Template Registry ────────────────────────────────────────────────────────
# Each entry is the canonical definition for one resume template.
# `supported_plans` lists the minimum plan and every plan above it.

TEMPLATE_REGISTRY: List[Dict[str, Any]] = [
    {
        "id": "template_1",
        "display_name": "Classic Professional",
        "internal_key": "Aditya_Soni_Resume",
        "category": "classic",
        "tags": ["ATS", "professional", "general"],
        "supported_plans": [PlanTier.STARTER, PlanTier.JOB_SEEKER, PlanTier.INTERVIEW_CRACKER],
        "accent_color": "#1d4ed8",
        "description": "Clean classic layout with centered header and blue section dividers. Standard ATS-safe structure.",
        "sort_order": 1,
        "active": True,
    },
    {
        "id": "template_2",
        "display_name": "Compact ATS",
        "internal_key": "resume_aditya_soni",
        "category": "compact",
        "tags": ["ATS", "compact", "one-page"],
        "supported_plans": [PlanTier.JOB_SEEKER, PlanTier.INTERVIEW_CRACKER],
        "accent_color": "#111827",
        "description": "Dense single-column format. Fits more content on one page without sacrificing readability.",
        "sort_order": 2,
        "active": True,
    },
    {
        "id": "template_3",
        "display_name": "Modern ATS Professional",
        "internal_key": "modern_ats_professional",
        "category": "modern",
        "tags": ["ATS", "modern", "tech", "backend", "fullstack"],
        "supported_plans": [PlanTier.INTERVIEW_CRACKER],
        "accent_color": "#1d4ed8",
        "description": "Contemporary design with left-aligned name, blue accents, and bold section headers.",
        "sort_order": 3,
        "active": True,
    },
    {
        "id": "template_4",
        "display_name": "Minimal One-Column",
        "internal_key": "minimal_one_column",
        "category": "minimal",
        "tags": ["minimal", "ATS", "clean"],
        "supported_plans": [PlanTier.INTERVIEW_CRACKER],
        "accent_color": "#111827",
        "description": "Typography-first minimalist resume. Maximum whitespace, understated section markers, zero visual noise.",
        "sort_order": 4,
        "active": True,
    },
    {
        "id": "template_5",
        "display_name": "Executive Clean",
        "internal_key": "executive_clean",
        "category": "executive",
        "tags": ["executive", "leadership", "corporate", "ATS"],
        "supported_plans": [PlanTier.INTERVIEW_CRACKER],
        "accent_color": "#1e3a8a",
        "description": "Refined executive structure with strong divisions and leadership emphasis.",
        "sort_order": 5,
        "active": True,
    },
    {
        "id": "template_6",
        "display_name": "Sidebar Professional",
        "internal_key": "sidebar_professional",
        "category": "sidebar",
        "tags": ["sidebar", "premium", "modern"],
        "supported_plans": [PlanTier.INTERVIEW_CRACKER],
        "accent_color": "#0369a1",
        "description": "Premium two-column layout with contact and skills in a structured sidebar.",
        "sort_order": 6,
        "active": True,
    },
    {
        "id": "template_7",
        "display_name": "Technical Skills First",
        "internal_key": "technical_skills_first",
        "category": "technical",
        "tags": ["ATS", "technical", "skills", "software"],
        "supported_plans": [PlanTier.INTERVIEW_CRACKER],
        "accent_color": "#1e293b",
        "description": "Skills-led structure for engineering roles and keyword-heavy applications.",
        "sort_order": 7,
        "active": True,
    },
    {
        "id": "template_8",
        "display_name": "Project Portfolio",
        "internal_key": "project_portfolio",
        "category": "technical",
        "tags": ["ATS", "projects", "developer", "portfolio"],
        "supported_plans": [PlanTier.INTERVIEW_CRACKER],
        "accent_color": "#1e3a8a",
        "description": "Projects appear before experience for builders with strong portfolio proof.",
        "sort_order": 8,
        "active": True,
    },
    {
        "id": "template_9",
        "display_name": "Senior Leadership",
        "internal_key": "senior_leadership",
        "category": "executive",
        "tags": ["senior", "strategy", "leadership"],
        "supported_plans": [PlanTier.INTERVIEW_CRACKER],
        "accent_color": "#111827",
        "description": "Boardroom-style layout with a compact leadership profile and firm rules.",
        "sort_order": 9,
        "active": True,
    },
    {
        "id": "template_10",
        "display_name": "Corporate Compact",
        "internal_key": "corporate_compact",
        "category": "corporate",
        "tags": ["ATS", "corporate", "compact", "professional"],
        "supported_plans": [PlanTier.INTERVIEW_CRACKER],
        "accent_color": "#1d4ed8",
        "description": "Balanced corporate resume with compact sections and restrained blue accents.",
        "sort_order": 10,
        "active": True,
    },
]

# Fast lookup by template id
_TEMPLATE_MAP: Dict[str, Dict[str, Any]] = {t["id"]: t for t in TEMPLATE_REGISTRY}

# New slug IDs → legacy template_N keys
SLUG_ALIASES: Dict[str, str] = {
    "classic-professional":    "template_1",
    "compact-ats":             "template_2",
    "modern-ats-professional": "template_3",
    "minimal-one-column":      "template_4",
    "executive-clean":         "template_5",
    "sidebar-professional":    "template_6",
    "technical-skills-first":  "template_7",
    "project-portfolio":       "template_8",
    "senior-leadership":       "template_9",
    "corporate-compact":       "template_10",
    # Backward-compatible aliases for previously shipped slugs.
    "clean-minimal":           "template_4",
    "technical-engineer":      "template_7",
    "compact-one-page":        "template_10",
    "executive-professional":  "template_5",
    "skills-first-hybrid":     "template_7",
    "project-heavy-developer": "template_8",
    "elegant-corporate":       "template_10",
}


def get_template(template_id: str) -> Optional[Dict[str, Any]]:
    """Return template metadata by id, or None if not found.
    Accepts both legacy 'template_N' IDs and new slug IDs."""
    resolved = SLUG_ALIASES.get(template_id, template_id)
    return _TEMPLATE_MAP.get(resolved)


def can_use_template(plan: PlanTier, template_id: str) -> bool:
    """Return True if the given plan is allowed to use this template.
    Accepts both legacy 'template_N' IDs and new slug IDs."""
    tmpl = get_template(template_id)
    if not tmpl or not tmpl.get("active"):
        return False
    return plan in tmpl["supported_plans"]


def get_templates_for_plan(plan: PlanTier) -> List[Dict[str, Any]]:
    """
    Return all active templates sorted by sort_order.
    Each entry includes a `locked` boolean: True when the plan cannot use it.
    `supported_plans` is serialized to plain strings for JSON compatibility.
    """
    result = []
    for tmpl in sorted(TEMPLATE_REGISTRY, key=lambda x: x["sort_order"]):
        if not tmpl.get("active"):
            continue
        entry = {
            **tmpl,
            "locked": plan not in tmpl["supported_plans"],
            "supported_plans": [p.value for p in tmpl["supported_plans"]],
        }
        result.append(entry)
    return result


def plan_from_string(plan_str: Optional[str]) -> PlanTier:
    """Convert a raw string (from DB) to PlanTier, defaulting to STARTER."""
    if not plan_str:
        return PlanTier.STARTER
    try:
        return PlanTier(plan_str)
    except ValueError:
        return PlanTier.STARTER


def required_plan_for_template(template_id: str) -> Optional[str]:
    """Return the display name of the lowest plan required for this template."""
    tmpl = get_template(template_id)
    if not tmpl:
        return None
    plans = tmpl.get("supported_plans", [])
    # Plans are ordered from lowest to highest in the registry
    tier_order = [PlanTier.STARTER, PlanTier.JOB_SEEKER, PlanTier.INTERVIEW_CRACKER]
    display = {
        PlanTier.STARTER: "Starter",
        PlanTier.JOB_SEEKER: "Job Seeker",
        PlanTier.INTERVIEW_CRACKER: "Interview Cracker",
    }
    for tier in tier_order:
        if tier in plans:
            return display[tier]
    return None
