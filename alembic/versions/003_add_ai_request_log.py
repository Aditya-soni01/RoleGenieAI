"""Add ai_request_log table for tracking AI API requests.

Revision ID: 003
Revises: 002
Create Date: 2024-01-15 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import sqlite

# revision identifiers, used by Alembic.
revision = '003'
down_revision = '002'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create or patch ai_request_logs table."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if "ai_request_logs" in inspector.get_table_names():
        existing_columns = {column["name"] for column in inspector.get_columns("ai_request_logs")}

        def add_column_if_missing(column_name: str, column: sa.Column) -> None:
            if column_name not in existing_columns:
                op.add_column("ai_request_logs", column)

        add_column_if_missing("request_timestamp", sa.Column("request_timestamp", sa.DateTime(), nullable=True))
        add_column_if_missing("response_timestamp", sa.Column("response_timestamp", sa.DateTime(), nullable=True))
        add_column_if_missing("input_text", sa.Column("input_text", sa.Text(), nullable=True))
        add_column_if_missing("output_text", sa.Column("output_text", sa.Text(), nullable=True))
        add_column_if_missing("processing_time_ms", sa.Column("processing_time_ms", sa.Integer(), nullable=True))
        add_column_if_missing("cost_usd", sa.Column("cost_usd", sa.Float(), nullable=True))
        add_column_if_missing("error_code", sa.Column("error_code", sa.String(50), nullable=True))
        add_column_if_missing("metadata", sa.Column("metadata", sqlite.JSON(), nullable=True))
        add_column_if_missing("ip_address", sa.Column("ip_address", sa.String(45), nullable=True))
        add_column_if_missing("user_agent", sa.Column("user_agent", sa.String(500), nullable=True))

        existing_indexes = {index["name"] for index in inspector.get_indexes("ai_request_logs")}
        if "idx_ai_request_logs_user_id" not in existing_indexes:
            op.create_index("idx_ai_request_logs_user_id", "ai_request_logs", ["user_id"])
        if "idx_ai_request_logs_request_type" not in existing_indexes:
            op.create_index("idx_ai_request_logs_request_type", "ai_request_logs", ["request_type"])
        if "ix_ai_request_logs_request_timestamp" not in existing_indexes and "request_timestamp" in existing_columns:
            op.create_index("ix_ai_request_logs_request_timestamp", "ai_request_logs", ["request_timestamp"])
        return

    op.create_table(
        'ai_request_logs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('request_type', sa.String(50), nullable=False),
        sa.Column('request_timestamp', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('response_timestamp', sa.DateTime(), nullable=True),
        sa.Column('status', sa.String(20), nullable=False, server_default='pending'),
        sa.Column('input_text', sa.Text(), nullable=False, server_default=''),
        sa.Column('output_text', sa.Text(), nullable=True),
        sa.Column('input_tokens', sa.Integer(), nullable=True),
        sa.Column('output_tokens', sa.Integer(), nullable=True),
        sa.Column('processing_time_ms', sa.Integer(), nullable=True),
        sa.Column('cost_usd', sa.Float(), nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('error_code', sa.String(50), nullable=True),
        sa.Column('metadata', sqlite.JSON(), nullable=True),
        sa.Column('ip_address', sa.String(45), nullable=True),
        sa.Column('user_agent', sa.String(500), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_ai_request_logs_user_id', 'ai_request_logs', ['user_id'])
    op.create_index('idx_ai_request_logs_request_type', 'ai_request_logs', ['request_type'])
    op.create_index('ix_ai_request_logs_request_timestamp', 'ai_request_logs', ['request_timestamp'])


def downgrade() -> None:
    """Drop ai_request_logs table."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if "ai_request_logs" not in inspector.get_table_names():
        return
    existing_indexes = {index["name"] for index in inspector.get_indexes("ai_request_logs")}
    if 'ix_ai_request_logs_request_timestamp' in existing_indexes:
        op.drop_index('ix_ai_request_logs_request_timestamp', table_name='ai_request_logs')
    if 'idx_ai_request_logs_created_at' in existing_indexes:
        op.drop_index('idx_ai_request_logs_created_at', table_name='ai_request_logs')
    if 'idx_ai_request_logs_request_type' in existing_indexes:
        op.drop_index('idx_ai_request_logs_request_type', table_name='ai_request_logs')
    if 'idx_ai_request_logs_user_id' in existing_indexes:
        op.drop_index('idx_ai_request_logs_user_id', table_name='ai_request_logs')
    op.drop_table('ai_request_logs')
