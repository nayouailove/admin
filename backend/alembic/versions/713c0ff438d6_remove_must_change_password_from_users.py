"""remove must_change_password from users

비밀번호 강제 변경 기능을 제거하기 위한 마이그레이션입니다.

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '713c0ff438d6'
down_revision: Union[str, Sequence[str], None] = '8ad644051438'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_column("users", "must_change_password")


def downgrade() -> None:
    op.add_column(
        "users",
        sa.Column(
            "must_change_password",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )
