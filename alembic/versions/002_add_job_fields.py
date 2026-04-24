"""Add job fields: category, skills, salary, experience_level.

Revision ID: 002
Revises: 001
Create Date: 2024-01-15 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "002"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create or patch the jobs table.

    Older local SQLite databases in this project were created with
    Base.metadata.create_all(), so Alembic may be run against a database that
    is missing this table entirely.
    """
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if "jobs" not in inspector.get_table_names():
        op.create_table(
            "jobs",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("title", sa.String(255), nullable=False),
            sa.Column("description", sa.String(5000), nullable=False),
            sa.Column("company", sa.String(255), nullable=False),
            sa.Column("category", sa.String(100), nullable=True),
            sa.Column("location", sa.String(255), nullable=False),
            sa.Column("experience_level", sa.String(50), nullable=True, server_default="mid"),
            sa.Column("salary_min", sa.Float(), nullable=True),
            sa.Column("salary_max", sa.Float(), nullable=True),
            sa.Column("required_skills", sa.String(1000), nullable=True, server_default=""),
            sa.Column("job_type", sa.String(100), nullable=True, server_default="Full-time"),
            sa.Column("remote", sa.Boolean(), nullable=True, server_default="0"),
            sa.Column("posted_date", sa.DateTime(), nullable=False, server_default=sa.func.now()),
            sa.Column("deadline", sa.DateTime(), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index("ix_jobs_id", "jobs", ["id"])
        op.create_index("ix_jobs_title", "jobs", ["title"])
        op.create_index("ix_jobs_company", "jobs", ["company"])
        op.create_index("ix_jobs_category", "jobs", ["category"])
        op.create_index("ix_jobs_location", "jobs", ["location"])
        op.create_index("ix_jobs_experience_level", "jobs", ["experience_level"])
        return

    existing_columns = {column["name"] for column in inspector.get_columns("jobs")}

    def add_column_if_missing(column_name: str, column: sa.Column) -> None:
        if column_name not in existing_columns:
            op.add_column("jobs", column)

    add_column_if_missing("category", sa.Column("category", sa.String(100), nullable=True))
    add_column_if_missing("salary_min", sa.Column("salary_min", sa.Float(), nullable=True))
    add_column_if_missing("salary_max", sa.Column("salary_max", sa.Float(), nullable=True))
    add_column_if_missing("experience_level", sa.Column("experience_level", sa.String(50), nullable=True, server_default="mid"))
    add_column_if_missing("required_skills", sa.Column("required_skills", sa.String(1000), nullable=True, server_default=""))
    add_column_if_missing("job_type", sa.Column("job_type", sa.String(100), nullable=True, server_default="Full-time"))
    add_column_if_missing("remote", sa.Column("remote", sa.Boolean(), nullable=True, server_default="0"))

    existing_indexes = {index["name"] for index in inspector.get_indexes("jobs")}
    if "ix_jobs_experience_level" not in existing_indexes:
        op.create_index("ix_jobs_experience_level", "jobs", ["experience_level"])


def downgrade() -> None:
    """Remove added columns from jobs table."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if "jobs" not in inspector.get_table_names():
        return
    existing_indexes = {index["name"] for index in inspector.get_indexes("jobs")}
    if "ix_jobs_experience_level" in existing_indexes:
        op.drop_index("ix_jobs_experience_level", table_name="jobs")
    existing_columns = {column["name"] for column in inspector.get_columns("jobs")}
    for column_name in ("remote", "job_type", "required_skills", "experience_level", "salary_max", "salary_min", "category"):
        if column_name in existing_columns:
            op.drop_column("jobs", column_name)
