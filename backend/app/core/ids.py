from __future__ import annotations

import uuid


def uuid_from_company_id(company_id: str) -> uuid.UUID:
    """
    MVP compatibility:
    - Spec uses UUID in Postgres.
    - Sales/checklist sometimes uses slugs like "kaz-minerals".
    We deterministically convert any string to a UUID.
    """
    s = company_id.strip()
    try:
        return uuid.UUID(s)
    except Exception:
        return uuid.uuid5(uuid.NAMESPACE_URL, s.lower())

