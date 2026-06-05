#!/bin/sh
set -e

DB_HOST="${DB_HOST:-db}"
DB_PORT="${DB_PORT:-5432}"

echo "Waiting for database..."

until pg_isready \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U application \
    -d FinancialDataDB
do
    sleep 2
done

if [ -z "$(ls -A alembic/versions)" ]; then
    echo "Generating initial migration..."
    alembic revision --autogenerate -m "initial"
fi

alembic upgrade head

exec "$@"