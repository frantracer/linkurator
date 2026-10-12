from datetime import datetime, timezone
from uuid import UUID

from linkurator_core.domain.common.mock_factory import mock_item
from linkurator_core.domain.items.item_embedding import (
    MAX_EMBEDDING_DESCRIPTION_LENGTH,
    ItemEmbedding,
    item_embedding_text,
    item_embedding_text_hash,
)


def test_item_embedding_text_includes_all_fields() -> None:
    item = mock_item(
        name="Learning Rust",
        description="A video about the borrow checker",
        provider="youtube",
    )

    assert item_embedding_text(item) == (
        "Title: Learning Rust\n"
        "Provider: youtube\n"
        "Description: A video about the borrow checker"
    )


def test_item_embedding_text_truncates_long_descriptions() -> None:
    item = mock_item(description="a" * (MAX_EMBEDDING_DESCRIPTION_LENGTH + 100))

    description = item_embedding_text(item).split("Description: ")[1]

    assert len(description) == MAX_EMBEDDING_DESCRIPTION_LENGTH


def test_new_item_embedding_sets_creation_date() -> None:
    now = datetime(2024, 5, 1, tzinfo=timezone.utc)
    item = mock_item()

    text_hash = item_embedding_text_hash("text")
    embedding = ItemEmbedding.new(item_uuid=item.uuid, vector=[0.1, 0.2], text_hash=text_hash, now_function=lambda: now)

    assert embedding.item_uuid == item.uuid
    assert embedding.vector == [0.1, 0.2]
    assert embedding.text_hash == text_hash
    assert embedding.created_at == now


def test_item_embedding_text_hash_is_the_md5_of_the_text() -> None:
    assert item_embedding_text_hash("text") == UUID("1cb251ec-0d56-8de6-a929-b520c4aed8d1")
    assert item_embedding_text_hash("text") != item_embedding_text_hash("other text")
