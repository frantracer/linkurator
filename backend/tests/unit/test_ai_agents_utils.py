import pytest

from linkurator_core.infrastructure.ai_agents.utils import format_duration


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
