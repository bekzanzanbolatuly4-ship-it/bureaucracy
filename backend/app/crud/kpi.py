from __future__ import annotations

import uuid
from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.ids import uuid_from_company_id
from app.models.company import Company
from app.models.kpi import KPI
from app.schemas.kpi import KPIImportItem


async def create_company_if_missing(session: AsyncSession, *, company_name: str) -> Company:
    company_uuid = uuid_from_company_id(company_name)
    res = await session.execute(select(Company).where(Company.id == company_uuid))
    company = res.scalar_one_or_none()
    if company:
        return company

    company = Company(id=company_uuid, name=company_name)
    session.add(company)
    await session.flush()
    return company


async def upsert_kpis(session: AsyncSession, *, company_id: uuid.UUID, items: list[KPIImportItem]) -> None:
    for item in items:
        res = await session.execute(
            select(KPI).where(
                and_(
                    KPI.company_id == company_id,
                    KPI.metric_name == item.metric_name,
                    KPI.period_date == item.period_date,
                )
            )
        )
        existing = res.scalar_one_or_none()
        if existing:
            existing.value = item.value
            existing.target = item.target
        else:
            session.add(
                KPI(
                    company_id=company_id,
                    metric_name=item.metric_name,
                    value=item.value,
                    target=item.target,
                    period_date=item.period_date,
                )
            )


async def get_kpi_summary(
    session: AsyncSession, *, company_id: uuid.UUID
) -> list[KPI]:
    res = await session.execute(select(KPI).where(KPI.company_id == company_id).order_by(KPI.period_date.desc()))
    return list(res.scalars().all())

