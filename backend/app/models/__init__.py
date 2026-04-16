from __future__ import annotations

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


# Import models so SQLAlchemy registers tables in `Base.metadata`.
# Alembic relies on this during migration runs.
from app.models.company import Company  # noqa: E402,F401
from app.models.user import User  # noqa: E402,F401
from app.models.kpi import KPI  # noqa: E402,F401
from app.models.workflow import Workflow, AILog  # noqa: E402,F401


