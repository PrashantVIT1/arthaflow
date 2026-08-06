import os

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/insightflow")

Base = declarative_base()

# Lazy initialization to avoid import-time database connection
_engine = None
_SessionLocal = None


def get_engine():
    """Get or create database engine."""
    global _engine
    if _engine is None:
        _engine = create_engine(
            DATABASE_URL,
            pool_pre_ping=True,  # Test connections before using them from pool
            pool_recycle=3600,  # Recycle connections after 1 hour (Render's typical idle timeout)
        )
    return _engine


def get_session_local():
    """Get or create SessionLocal."""
    global _SessionLocal
    if _SessionLocal is None:
        _SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=get_engine())
    return _SessionLocal


# For backward compatibility - expose as module-level properties
class _DatabaseConfig:
    @property
    def engine(self):
        return get_engine()

    @property
    def SessionLocal(self):
        return get_session_local()


_db_config = _DatabaseConfig()
engine = _db_config.engine
SessionLocal = _db_config.SessionLocal


def get_db():
    """Dependency for database session."""
    db = get_session_local()()
    try:
        yield db
    finally:
        db.close()
