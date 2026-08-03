"""make_adj_close_nullable

Revision ID: make_adj_close_nullable
Revises: fix_volume_type
Create Date: 2026-08-02 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'make_adj_close_nullable'
down_revision: Union[str, Sequence[str], None] = 'fix_volume_type'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        'stock_prices',
        'adj_close',
        existing_type=sa.Numeric(10, 4),
        nullable=True
    )
    op.alter_column(
        'stock_exchange_indexe_rates',
        'adj_close',
        existing_type=sa.Numeric(10, 4),
        nullable=True
    )


def downgrade() -> None:
    op.alter_column(
        'stock_exchange_indexe_rates',
        'adj_close',
        existing_type=sa.Numeric(10, 4),
        nullable=False
    )
    op.alter_column(
        'stock_prices',
        'adj_close',
        existing_type=sa.Numeric(10, 4),
        nullable=False
    )
