import os
from logging.config import fileConfig
from dotenv import load_dotenv
from sqlalchemy import engine_from_config
from sqlalchemy import pool
from alembic import context
from db.database import Base
import db.models

load_dotenv(os.path.join(os.path.dirname(__file__), '.../.env'))
from core.config import settings
config = context.config if hasattr(context, 'config') else None

if not config.get_main_option("sqlalchemy.url"):
    config.set_main_option(
        "sqlalchemy.url",
        settings.ALEMBIC_DATABASE_URL,
    )

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

def get_url():
    return os.getenv('ALEMBIC_DATABASE_URL')

target_metadata = Base.metadata

def run_migrations_offline() -> None:
    cfg = context.config if hasattr(context, 'config') else config 
    if cfg is None:
        return # Przerwij, jeśli to tylko import testowy
    url = get_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    configuration = config.get_section(config.config_ini_section, {})
    configuration["sqlalchemy.url"] = get_url()
    
    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            compare_server_default=True,
        )

        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()

