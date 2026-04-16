# Bureaucracy Buster KZ (MVP Scaffold)

FastAPI + Postgres + Redis + React dashboard.

## Quick start (Docker)

1. `docker-compose up -d` (from repo root)
2. `curl http://localhost:8000/health`
3. KPI import smoke test:
   - `curl -X POST http://localhost:8000/api/v1/kpi/import -H "Content-Type: application/json" -d '{"company_id":"kaz-minerals","tasks":[{"name":"director_approval","duration_hours":72}]}'`

