#!/bin/sh
set -e

echo "Waiting for database..."

alembic upgrade head

exec "$@"