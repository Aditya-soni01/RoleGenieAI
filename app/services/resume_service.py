from typing import List, Optional
from sqlalchemy.orm import Session

from app.models.resume import Resume


class ResumeService:
    @staticmethod
    def get_user_resumes(db: Session, user_id: int) -> List[Resume]:
        return db.query(Resume).filter(Resume.user_id == user_id).order_by(Resume.created_at.desc()).all()

    @staticmethod
    def get_resume(db: Session, resume_id: int, user_id: int) -> Optional[Resume]:
        return db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == user_id).first()

    @staticmethod
    def create_resume(db: Session, user_id: int, file_name: str, content: str) -> Resume:
        resume = Resume(user_id=user_id, file_name=file_name, original_content=content)
        db.add(resume)
        db.commit()
        db.refresh(resume)
        return resume

    @staticmethod
    def update_optimized(db: Session, resume: Resume, optimized_content: str) -> Resume:
        resume.optimized_content = optimized_content
        db.commit()
        db.refresh(resume)
        return resume

    @staticmethod
    def delete_resume(db: Session, resume: Resume) -> None:
        db.delete(resume)
        db.commit()
