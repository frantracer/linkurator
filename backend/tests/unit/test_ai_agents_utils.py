from datetime import date, datetime, timezone

import pytest

from linkurator_core.infrastructure.ai_agents.utils import (
    build_similar_items_filter,
    clean_concepts,
    format_duration,
    minutes_to_seconds,
    start_of_day_utc,
)


@pytest.mark.parametrize(
    ("seconds", "expected"),
    [
        (1, "1s"),
        (45, "45s"),
        (60, "1m"),
        (754, "12m 34s"),
        (3600, "1h"),
        (3601, "1h 1s"),
        (3723, "1h 2m 3s"),
        (7500, "2h 5m"),
        (90000, "25h"),
    ],
)
def test_format_duration_returns_a_readable_duration(seconds: int, expected: str) -> None:
    assert format_duration(seconds) == expected


@pytest.mark.parametrize("seconds", [None, 0, -5])
def test_format_duration_returns_none_when_the_duration_is_unknown(seconds: int | None) -> None:
    assert format_duration(seconds) is None


def test_start_of_day_utc() -> None:
    assert start_of_day_utc(date(2025, 6, 15)) == datetime(2025, 6, 15, tzinfo=timezone.utc)
    assert start_of_day_utc(None) is None


def test_minutes_to_seconds() -> None:
    assert minutes_to_seconds(5) == 300
    assert minutes_to_seconds(None) is None


def test_build_similar_items_filter_converts_units_and_deduplicates_providers() -> None:
    search_filter = build_similar_items_filter(
        min_duration_minutes=5,
        max_duration_minutes=None,
        published_after=date(2025, 6, 15),
        published_before=None,
        providers=["youtube", "spotify", "youtube"],
    )

    assert search_filter.min_duration == 300
    assert search_filter.max_duration is None
    assert search_filter.published_after == datetime(2025, 6, 15, tzinfo=timezone.utc)
    assert search_filter.published_before is None
    assert search_filter.providers == ["youtube", "spotify"]


def test_clean_concepts_strips_and_drops_empty_concepts() -> None:
    assert clean_concepts([" football ", "", "   ", "politics"]) == ["football", "politics"]
