"""initial schema

Revision ID: 0001_initial
Revises: 
Create Date: 2026-04-16
"""

from __future__ import annotations

import sqlalchemy as sa
import sqlalchemy.dialects.postgresql as pg
from alembic import op


# revision identifiers, used by Alembic.
revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    role_enum = pg.ENUM(
        "superadmin",
        "company_admin",
        "executive",
        "analyst",
        name="userrole",
    )
    role_enum.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "companies",
        sa.Column("id", pg.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("industry", sa.String(length=100), nullable=True),
        sa.Column("employee_count", sa.Integer(), nullable=True),
        sa.Column("annual_revenue_kzt", sa.Integer(), nullable=True),
        sa.Column("bin", sa.String(length=12), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
    )

    op.create_table(
        "users",
        sa.Column("id", pg.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("company_id", pg.UUID(as_uuid=True), nullable=True),
        sa.Column("role", role_enum, nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.UniqueConstraint("email"),
        sa.ForeignKeyConstraint(["company_id"], ["companies.id"]),
    )

    op.create_table(
        "kpis",
        sa.Column("id", pg.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("company_id", pg.UUID(as_uuid=True), nullable=False),
        sa.Column("metric_name", sa.String(length=100), nullable=False),
        sa.Column("value", sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column("target", sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column("period_date", sa.Date(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["company_id"], ["companies.id"]),
    )

    op.create_index("ix_kpis_company_id", "kpis", ["company_id"])

    op.create_table(
        "workflows",
        sa.Column("id", pg.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("company_id", pg.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("steps", pg.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("avg_duration_hours", sa.Float(), nullable=True),
        sa.Column("bottleneck_score", sa.Float(), nullable=True),
        sa.ForeignKeyConstraint(["company_id"], ["companies.id"]),
    )

    op.create_table(
        "ai_logs",
        sa.Column("id", pg.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("company_id", pg.UUID(as_uuid=True), nullable=False),
        sa.Column("prompt", sa.Text(), nullable=False),
        sa.Column("response", pg.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("execution_ms", sa.Integer(), nullable=False),
        sa.Column("model_version", sa.String(length=50), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["company_id"], ["companies.id"]),
    )


def downgrade() -> None:
    op.drop_table("ai_logs")
    op.drop_table("workflows")
    op.drop_index("ix_kpis_company_id", table_name="kpis")
    op.drop_table("kpis")
    op.drop_table("users")
    op.drop_table("companies")
    role_enum = pg.ENUM(name="userrole")
    role_enum.drop(op.get_bind(), checkfirst=True)

