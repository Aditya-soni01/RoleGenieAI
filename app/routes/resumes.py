from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
import logging

from app.core.database import get_db
from app.schemas.resume import ResumeResponse
from app.services.resume_service import ResumeService
from app.services.auth_service import get_current_user
from app.services.ai_service import AIService
from app.models.user import User

logger = logging.getLogger(__name__)
router = APIRouter()
ai_service = AIService(api_key="")

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB
ALLOWED_TYPES = {"text/plain", "application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"}


@router.get("", response_model=List[ResumeResponse])
def list_resumes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[ResumeResponse]:
    return ResumeService.get_user_resumes(db, current_user.id)


@router.post("/upload", response_model=ResumeResponse, status_code=status.HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ResumeResponse:
    content_bytes = await file.read()
    if len(content_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="File exceeds 5 MB limit")

    # Decode text content (best-effort for PDF/DOCX — store raw bytes as latin-1 for now)
    try:
        text = content_bytes.decode("utf-8")
    except UnicodeDecodeError:
        try:
            text = content_bytes.decode("latin-1")
        except Exception:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot read file content")

    resume = ResumeService.create_resume(db, current_user.id, file.filename or "resume", text)
    logger.info(f"User {current_user.id} uploaded resume {resume.id}")
    return resume


@router.post("/{resume_id}/optimize", response_model=ResumeResponse)
def optimize_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ResumeResponse:
    resume = ResumeService.get_resume(db, resume_id, current_user.id)
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")

    try:
        result = ai_service.optimize_resume(resume_text=resume.original_content, target_job_title="")
        analysis = result.get("analysis", {})
        optimized = analysis.get("optimized_summary") or resume.original_content
    except Exception as e:
        logger.error(f"AI optimization error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="AI optimization failed")

    return ResumeService.update_optimized(db, resume, optimized)


@router.delete("/{resume_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    resume = ResumeService.get_resume(db, resume_id, current_user.id)
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")
    ResumeService.delete_resume(db, resume)
