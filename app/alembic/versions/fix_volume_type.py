"""fix_volume_column_type

Revision ID: fix_volume_type
Revises: ca5ad869142a
Create Date: 2026-07-31 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'fix_volume_type'
down_revision: Union[str, Sequence[str], None] = 'ca5ad869142a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        'stock_prices',
        'volume',
        type_=sa.Numeric(20, 4),
        existing_type=sa.Numeric(10, 4),
        existing_nullable=False
    )
    op.alter_column(
        'stock_exchange_indexe_rates',
        'volume',
        type_=sa.Numeric(20, 4),
        existing_type=sa.Numeric(10, 4),
        existing_nullable=False
    )


def downgrade() -> None:
    op.alter_column(
        'stock_exchange_indexe_rates',
        'volume',
        type_=sa.Numeric(10, 4),
        existing_type=sa.Numeric(20, 4),
        existing_nullable=False
    )
    op.alter_column(
        'stock_prices',
        'volume',
        type_=sa.Numeric(10, 4),
        existing_type=sa.Numeric(20, 4),
        existing_nullable=False
    )
