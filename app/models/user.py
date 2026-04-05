from sqlalchemy import Column, Integer, String, JSON, DateTime, Boolean
from datetime import datetime

from app.core.database import Base


class User(Base):
    """
    User model representing a registered user of the Job Assistant.
    
    Attributes:
        id: Primary key
        email: Unique email address
        username: Unique username
        hashed_password: Bcrypt hashed password
        first_name: User's first name
        last_name: User's last name
        skills: JSON array of user's professional skills
        is_active: Whether the user account is active
        created_at: Account creation timestamp
        updated_at: Last account update timestamp
    
    Relationships:
        - applications: One-to-many with Application model
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    first_name = Column(String(255), nullable=True)
    last_name = Column(String(255), nullable=True)
    skills = Column(JSON, nullable=True, default=list)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email={self.email}, username={self.username})>"
    
    def has_skill(self, skill: str) -> bool:
        """
        Check if user has a specific skill.
        
        Args:
            skill: Skill name to check
            
        Returns:
            True if skill exists in user's skills list
        """
        if not self.skills:
            return False
        return skill.lower() in [s.lower() for s in self.skills]
    
    def add_skill(self, skill: str) -> None:
        """
        Add a skill to the user's skills list.
        
        Args:
            skill: Skill name to add
        """
        if not self.skills:
            self.skills = []
        if not self.has_skill(skill):
            self.skills.append(skill)
    
    def remove_skill(self, skill: str) -> None:
        """
        Remove a skill from the user's skills list.
        
        Args:
            skill: Skill name to remove
        """
        if self.skills:
            self.skills = [s for s in self.skills if s.lower() != skill.lower()]