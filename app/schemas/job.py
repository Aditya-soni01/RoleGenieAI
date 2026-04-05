from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime


class JobBase(BaseModel):
    """Base schema for Job with common fields."""
    title: str = Field(..., min_length=1, max_length=255, description="Job title")
    description: str = Field(..., min_length=10, max_length=5000, description="Job description")
    company: str = Field(..., min_length=1, max_length=255, description="Company name")
    location: str = Field(..., min_length=1, max_length=255, description="Job location")
    salary_min: Optional[float] = Field(None, ge=0, description="Minimum salary")
    salary_max: Optional[float] = Field(None, ge=0, description="Maximum salary")
    experience_level: Optional[str] = Field("mid", description="Required experience level")
    required_skills: Optional[str] = Field(default="", max_length=1000, description="Comma-separated required skills")
    job_type: Optional[str] = Field(default="Full-time", max_length=100, description="Job type (Full-time, Part-time, Contract)")
    remote: Optional[bool] = Field(default=False, description="Whether the job is remote")
    category: Optional[str] = Field(None, max_length=100, description="Job category")


class JobCreate(JobBase):
    """Schema for creating a new job."""
    pass


class JobUpdate(BaseModel):
    """Schema for updating a job (all fields optional)."""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, min_length=10, max_length=5000)
    company: Optional[str] = Field(None, min_length=1, max_length=255)
    location: Optional[str] = Field(None, min_length=1, max_length=255)
    salary_min: Optional[float] = Field(None, ge=0)
    salary_max: Optional[float] = Field(None, ge=0)
    experience_level: Optional[str] = None
    required_skills: Optional[str] = Field(None, max_length=1000)
    job_type: Optional[str] = Field(None, max_length=100)
    remote: Optional[bool] = None


class JobResponse(JobBase):
    """Schema for job API responses."""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class JobDetailResponse(JobResponse):
    """Extended job response with application count."""
    application_count: int = 0


class JobFilterRequest(BaseModel):
    """Schema for job filtering and search."""
    title: Optional[str] = Field(None, description="Search by job title")
    company: Optional[str] = Field(None, description="Filter by company")
    location: Optional[str] = Field(None, description="Filter by location")
    experience_level: Optional[str] = Field(None, description="Filter by experience level")
    skill: Optional[str] = Field(None, description="Filter by a required skill")
    salary_min: Optional[float] = Field(None, ge=0, description="Minimum salary filter")
    salary_max: Optional[float] = Field(None, ge=0, description="Maximum salary filter")


# Alias for backwards-compat with generated route code
JobFilterParams = JobFilterRequest


class JobScoreResponse(BaseModel):
    """Schema for job relevance scoring response."""
    job_id: int
    title: str
    company: str
    match_score: float = Field(..., ge=0, le=100, description="Match score percentage")
    matching_skills: List[str] = Field(default_factory=list, description="Skills that matched")
    missing_skills: List[str] = Field(default_factory=list, description="Skills that are missing")
    reason: str = Field(default="", description="Explanation of the score")

    class Config:
        from_attributes = True
