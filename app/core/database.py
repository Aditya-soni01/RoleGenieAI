from typing import Generator
import logging
from sqlalchemy import create_engine, Engine, event
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from sqlalchemy.pool import StaticPool

from app.core.config import settings

logger = logging.getLogger(__name__)

# Create the SQLAlchemy engine
if settings.database_url.startswith("sqlite"):
    # SQLite-specific configuration for testing and development
    engine: Engine = create_engine(
        settings.database_url,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        echo=settings.db_echo,
    )
else:
    # PostgreSQL and other database engines
    engine: Engine = create_engine(
        settings.database_url,
        echo=settings.db_echo,
        pool_pre_ping=True,
        pool_recycle=3600,
    )

# Create the session factory
SessionLocal: sessionmaker = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

# Create the declarative base for ORM models
Base = declarative_base()


@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_conn, connection_record):
    """
    Enable foreign key support for SQLite.
    This event listener runs on each database connection.
    """
    if settings.database_url.startswith("sqlite"):
        cursor = dbapi_conn.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()


def get_db() -> Generator[Session, None, None]:
    """
    Dependency function to get a database session.
    Yields a Session instance and ensures proper cleanup.

    Yields:
        Session: SQLAlchemy database session for a single request.

    Example:
        @app.get("/items")
        def read_items(db: Session = Depends(get_db)):
            return db.query(Item).all()
    """
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        logger.error(f"Database session error: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()


def init_db() -> None:
    """
    Initialize the database by creating all tables.
    Call this once at application startup to ensure schema exists.
    """
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created successfully")


def drop_db() -> None:
    """
    Drop all tables from the database.
    Use with caution - this is typically only for testing or reset scenarios.
    """
    Base.metadata.drop_all(bind=engine)
    logger.warning("All database tables dropped")


def get_engine() -> Engine:
    """
    Get the SQLAlchemy engine instance.

    Returns:
        Engine: The configured SQLAlchemy engine.
    """
    return engine