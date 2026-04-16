from __future__ import annotations

import uuid

from app.core.ids import uuid_from_company_id


def test_uuid_from_company_id_accepts_uuid() -> None:
    u = uuid.uuid4()
    assert uuid_from_company_id(str(u)) == u


def test_uuid_from_company_id_accepts_slug() -> None:
    u1 = uuid_from_company_id("kaz-minerals")
    u2 = uuid_from_company_id("KAZ-MINERALS")
    assert u1 == u2

