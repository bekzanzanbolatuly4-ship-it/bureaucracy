# Deployment (Kazakhstan) - MVP Notes

This repo scaffold is Docker-based. For production in Kazakhstan clouds:

- Set `JWT_SECRET`, `DATABASE_URL`, `REDIS_URL`
- Ensure PostgreSQL 16.x and Redis 7.x are available
- Put your API behind `NGINX` with HTTPS

