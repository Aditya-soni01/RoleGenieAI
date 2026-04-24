"""Add profile tables and user profile columns.

Revision ID: 004
Revises: 003
Create Date: 2026-04-15

"""
from alembic import op
import sqlalchemy as sa

revision = "004"
down_revision = "003"
branch_labels = None
depends_on = None


def _table_names() -> set[str]:
    return set(sa.inspect(op.get_bind()).get_table_names())


def _column_names(table_name: str) -> set[str]:
    return {column["name"] for column in sa.inspect(op.get_bind()).get_columns(table_name)}


def _index_names(table_name: str) -> set[str]:
    return {index["name"] for index in sa.inspect(op.get_bind()).get_indexes(table_name)}


def _create_users_if_missing() -> None:
    if "users" in _table_names():
        return

    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("username", sa.String(255), nullable=False),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("first_name", sa.String(255), nullable=True),
        sa.Column("last_name", sa.String(255), nullable=True),
        sa.Column("skills", sa.JSON(), nullable=True),
        sa.Column("plan_tier", sa.String(50), nullable=False, server_default="starter"),
        sa.Column("is_active", sa.Boolean(), nullable=True, server_default="1"),
        sa.Column("is_admin", sa.Boolean(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("profile_headline", sa.String(200), nullable=True),
        sa.Column("phone", sa.String(20), nullable=True),
        sa.Column("location", sa.String(100), nullable=True),
        sa.Column("linkedin_url", sa.String(300), nullable=True),
        sa.Column("github_url", sa.String(300), nullable=True),
        sa.Column("portfolio_url", sa.String(300), nullable=True),
        sa.Column("professional_summary", sa.Text(), nullable=True),
        sa.Column("profile_completeness", sa.Integer(), nullable=True, server_default="0"),
        sa.Column("preferences", sa.JSON(), nullable=True),
        sa.Column("is_profile_complete", sa.Boolean(), nullable=True, server_default="0"),
        sa.Column("last_login_at", sa.DateTime(), nullable=True),
        sa.Column("last_activity_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
        sa.UniqueConstraint("username"),
    )
    op.create_index("ix_users_id", "users", ["id"])
    op.create_index("ix_users_email", "users", ["email"])
    op.create_index("ix_users_username", "users", ["username"])


def _add_user_column_if_missing(column_name: str, column: sa.Column) -> None:
    if column_name not in _column_names("users"):
        op.add_column("users", column)


def _create_index_if_missing(index_name: str, table_name: str, columns: list[str]) -> None:
    if index_name not in _index_names(table_name):
        op.create_index(index_name, table_name, columns)


def upgrade() -> None:
    _create_users_if_missing()

    _add_user_column_if_missing("plan_tier", sa.Column("plan_tier", sa.String(50), nullable=False, server_default="starter"))
    _add_user_column_if_missing("profile_headline", sa.Column("profile_headline", sa.String(200), nullable=True))
    _add_user_column_if_missing("phone", sa.Column("phone", sa.String(20), nullable=True))
    _add_user_column_if_missing("location", sa.Column("location", sa.String(100), nullable=True))
    _add_user_column_if_missing("linkedin_url", sa.Column("linkedin_url", sa.String(300), nullable=True))
    _add_user_column_if_missing("github_url", sa.Column("github_url", sa.String(300), nullable=True))
    _add_user_column_if_missing("portfolio_url", sa.Column("portfolio_url", sa.String(300), nullable=True))
    _add_user_column_if_missing("professional_summary", sa.Column("professional_summary", sa.Text(), nullable=True))
    _add_user_column_if_missing("profile_completeness", sa.Column("profile_completeness", sa.Integer(), nullable=True, server_default="0"))
    _add_user_column_if_missing("preferences", sa.Column("preferences", sa.JSON(), nullable=True))
    _add_user_column_if_missing("is_profile_complete", sa.Column("is_profile_complete", sa.Boolean(), nullable=True, server_default="0"))

    tables = _table_names()

    if "user_skills" not in tables:
        op.create_table(
            "user_skills",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
            sa.Column("name", sa.String(100), nullable=False),
            sa.Column("category", sa.String(50), nullable=False),
            sa.Column("proficiency", sa.String(20), nullable=True),
        )
    _create_index_if_missing("ix_user_skills_user_id", "user_skills", ["user_id"])

    if "user_experiences" not in tables:
        op.create_table(
            "user_experiences",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
            sa.Column("job_title", sa.String(200), nullable=False),
            sa.Column("company", sa.String(200), nullable=False),
            sa.Column("location", sa.String(100), nullable=True),
            sa.Column("start_date", sa.String(20), nullable=False),
            sa.Column("end_date", sa.String(20), nullable=True),
            sa.Column("is_current", sa.Boolean(), nullable=True, server_default="0"),
            sa.Column("description", sa.Text(), nullable=True),
            sa.Column("order_index", sa.Integer(), nullable=True, server_default="0"),
        )
    _create_index_if_missing("ix_user_experiences_user_id", "user_experiences", ["user_id"])

    if "user_projects" not in tables:
        op.create_table(
            "user_projects",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
            sa.Column("experience_id", sa.Integer(), sa.ForeignKey("user_experiences.id", ondelete="SET NULL"), nullable=True),
            sa.Column("name", sa.String(200), nullable=False),
            sa.Column("description", sa.Text(), nullable=True),
            sa.Column("technologies", sa.String(500), nullable=True),
            sa.Column("bullets", sa.JSON(), nullable=True),
        )
    _create_index_if_missing("ix_user_projects_user_id", "user_projects", ["user_id"])

    if "user_education" not in tables:
        op.create_table(
            "user_education",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
            sa.Column("degree", sa.String(200), nullable=False),
            sa.Column("institution", sa.String(200), nullable=False),
            sa.Column("year", sa.String(20), nullable=True),
            sa.Column("details", sa.Text(), nullable=True),
        )
    _create_index_if_missing("ix_user_education_user_id", "user_education", ["user_id"])

    if "user_certifications" not in tables:
        op.create_table(
            "user_certifications",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
            sa.Column("name", sa.String(300), nullable=False),
            sa.Column("issuer", sa.String(200), nullable=True),
            sa.Column("date", sa.String(20), nullable=True),
            sa.Column("credential_url", sa.String(500), nullable=True),
        )
    _create_index_if_missing("ix_user_certifications_user_id", "user_certifications", ["user_id"])


def downgrade() -> None:
    tables = _table_names()
    for index_name, table_name in (
        ("ix_user_certifications_user_id", "user_certifications"),
        ("ix_user_education_user_id", "user_education"),
        ("ix_user_projects_user_id", "user_projects"),
        ("ix_user_experiences_user_id", "user_experiences"),
        ("ix_user_skills_user_id", "user_skills"),
    ):
        if table_name in tables and index_name in _index_names(table_name):
            op.drop_index(index_name, table_name=table_name)

    for table_name in ("user_certifications", "user_education", "user_projects", "user_experiences", "user_skills"):
        if table_name in tables:
            op.drop_table(table_name)

    if "users" not in tables:
        return

    existing_columns = _column_names("users")
    for column_name in (
        "is_profile_complete",
        "preferences",
        "profile_completeness",
        "professional_summary",
        "portfolio_url",
        "github_url",
        "linkedin_url",
        "location",
        "phone",
        "profile_headline",
    ):
        if column_name in existing_columns:
            op.drop_column("users", column_name)
