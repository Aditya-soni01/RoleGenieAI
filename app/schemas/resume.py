from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class ResumeResponse(BaseModel):
    id: int
    file_name: str
    original_content: str
    optimized_content: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
