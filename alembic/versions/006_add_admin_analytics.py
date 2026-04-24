"""Add admin analytics tables.

Revision ID: 006
Revises: 005
Create Date: 2026-04-17

"""
from alembic import op
import sqlalchemy as sa

revision = "006"
down_revision = "005"
branch_labels = None
depends_on = None


def _table_names() -> set[str]:
    return set(sa.inspect(op.get_bind()).get_table_names())


def _column_names(table_name: str) -> set[str]:
    return {column["name"] for column in sa.inspect(op.get_bind()).get_columns(table_name)}


def _index_names(table_name: str) -> set[str]:
    return {index["name"] for index in sa.inspect(op.get_bind()).get_indexes(table_name)}


def _add_column_if_missing(table_name: str, column_name: str, column: sa.Column) -> None:
    if table_name in _table_names() and column_name not in _column_names(table_name):
        op.add_column(table_name, column)


def _create_index_if_missing(index_name: str, table_name: str, columns: list[str], unique: bool = False) -> None:
    if table_name in _table_names() and index_name not in _index_names(table_name):
        op.create_index(index_name, table_name, columns, unique=unique)


def upgrade() -> None:
    _add_column_if_missing("users", "last_login_at", sa.Column("last_login_at", sa.DateTime(), nullable=True))
    _add_column_if_missing("users", "last_activity_at", sa.Column("last_activity_at", sa.DateTime(), nullable=True))

    tables = _table_names()

    if "activity_events" not in tables:
        op.create_table(
            "activity_events",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("event_name", sa.String(length=80), nullable=False),
            sa.Column("user_id", sa.Integer(), nullable=True),
            sa.Column("session_id", sa.String(length=128), nullable=True),
            sa.Column("page_path", sa.String(length=500), nullable=True),
            sa.Column("referrer_path", sa.String(length=500), nullable=True),
            sa.Column("funnel_step", sa.String(length=80), nullable=True),
            sa.Column("metadata", sa.JSON(), nullable=True),
            sa.Column("ip_address", sa.String(length=45), nullable=True),
            sa.Column("user_agent", sa.String(length=500), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
            sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="SET NULL"),
            sa.PrimaryKeyConstraint("id"),
        )

    _create_index_if_missing("ix_activity_events_id", "activity_events", ["id"])
    _create_index_if_missing("ix_activity_events_event_name", "activity_events", ["event_name"])
    _create_index_if_missing("ix_activity_events_user_id", "activity_events", ["user_id"])
    _create_index_if_missing("ix_activity_events_session_id", "activity_events", ["session_id"])
    _create_index_if_missing("ix_activity_events_page_path", "activity_events", ["page_path"])
    _create_index_if_missing("ix_activity_events_funnel_step", "activity_events", ["funnel_step"])
    _create_index_if_missing("ix_activity_events_created_at", "activity_events", ["created_at"])

    tables = _table_names()
    if "user_sessions" not in tables:
        op.create_table(
            "user_sessions",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("session_id", sa.String(length=128), nullable=False),
            sa.Column("user_id", sa.Integer(), nullable=True),
            sa.Column("started_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
            sa.Column("last_seen_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
            sa.Column("ended_at", sa.DateTime(), nullable=True),
            sa.Column("last_page_path", sa.String(length=500), nullable=True),
            sa.Column("referrer_path", sa.String(length=500), nullable=True),
            sa.Column("user_agent", sa.String(length=500), nullable=True),
            sa.Column("ip_address", sa.String(length=45), nullable=True),
            sa.Column("is_active", sa.Boolean(), nullable=False, server_default="1"),
            sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="SET NULL"),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("session_id"),
        )

    _create_index_if_missing("ix_user_sessions_id", "user_sessions", ["id"])
    _create_index_if_missing("ix_user_sessions_session_id", "user_sessions", ["session_id"])
    _create_index_if_missing("ix_user_sessions_user_id", "user_sessions", ["user_id"])
    _create_index_if_missing("ix_user_sessions_started_at", "user_sessions", ["started_at"])
    _create_index_if_missing("ix_user_sessions_last_seen_at", "user_sessions", ["last_seen_at"])
    _create_index_if_missing("ix_user_sessions_last_page_path", "user_sessions", ["last_page_path"])

    tables = _table_names()
    if "admin_audit_logs" not in tables:
        op.create_table(
            "admin_audit_logs",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("admin_user_id", sa.Integer(), nullable=True),
            sa.Column("action", sa.String(length=100), nullable=False),
            sa.Column("target_user_id", sa.Integer(), nullable=True),
            sa.Column("metadata", sa.JSON(), nullable=True),
            sa.Column("ip_address", sa.String(length=45), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
            sa.ForeignKeyConstraint(["admin_user_id"], ["users.id"], ondelete="SET NULL"),
            sa.ForeignKeyConstraint(["target_user_id"], ["users.id"], ondelete="SET NULL"),
            sa.PrimaryKeyConstraint("id"),
        )

    _create_index_if_missing("ix_admin_audit_logs_id", "admin_audit_logs", ["id"])
    _create_index_if_missing("ix_admin_audit_logs_admin_user_id", "admin_audit_logs", ["admin_user_id"])
    _create_index_if_missing("ix_admin_audit_logs_action", "admin_audit_logs", ["action"])
    _create_index_if_missing("ix_admin_audit_logs_target_user_id", "admin_audit_logs", ["target_user_id"])
    _create_index_if_missing("ix_admin_audit_logs_created_at", "admin_audit_logs", ["created_at"])


def downgrade() -> None:
    tables = _table_names()

    for index_name, table_name in (
        ("ix_admin_audit_logs_created_at", "admin_audit_logs"),
        ("ix_admin_audit_logs_target_user_id", "admin_audit_logs"),
        ("ix_admin_audit_logs_action", "admin_audit_logs"),
        ("ix_admin_audit_logs_admin_user_id", "admin_audit_logs"),
        ("ix_admin_audit_logs_id", "admin_audit_logs"),
        ("ix_user_sessions_last_page_path", "user_sessions"),
        ("ix_user_sessions_last_seen_at", "user_sessions"),
        ("ix_user_sessions_started_at", "user_sessions"),
        ("ix_user_sessions_user_id", "user_sessions"),
        ("ix_user_sessions_session_id", "user_sessions"),
        ("ix_user_sessions_id", "user_sessions"),
        ("ix_activity_events_created_at", "activity_events"),
        ("ix_activity_events_funnel_step", "activity_events"),
        ("ix_activity_events_page_path", "activity_events"),
        ("ix_activity_events_session_id", "activity_events"),
        ("ix_activity_events_user_id", "activity_events"),
        ("ix_activity_events_event_name", "activity_events"),
        ("ix_activity_events_id", "activity_events"),
    ):
        if table_name in tables and index_name in _index_names(table_name):
            op.drop_index(index_name, table_name=table_name)

    for table_name in ("admin_audit_logs", "user_sessions", "activity_events"):
        if table_name in tables:
            op.drop_table(table_name)

    if "users" in tables:
        user_columns = _column_names("users")
        if "last_activity_at" in user_columns:
            op.drop_column("users", "last_activity_at")
        if "last_login_at" in user_columns:
            op.drop_column("users", "last_login_at")
