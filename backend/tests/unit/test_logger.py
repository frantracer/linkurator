import logging

import logfire

from linkurator_core.infrastructure.config.settings import LogfireEnvironment, LogfireSettings, LogSettings
from linkurator_core.infrastructure.logger import TracebackFilter, configure_logging


def _raise_value_error() -> None:
    msg = "boom"
    raise ValueError(msg)


def _make_record_with_exc_info() -> logging.LogRecord:
    try:
        _raise_value_error()
    except ValueError:
        return logging.LogRecord(
            name="test", level=logging.ERROR, pathname=__file__, lineno=1,
            msg="failed", args=(), exc_info=True)  # type: ignore[arg-type]
    msg = "unreachable"
    raise AssertionError(msg)


def test_traceback_filter_strips_exc_info_by_default() -> None:
    record = _make_record_with_exc_info()
    assert record.exc_info is not None

    result = TracebackFilter(show_traces=False).filter(record)

    assert result is True
    assert record.exc_info is None
    assert record.exc_text is None


def test_traceback_filter_keeps_exc_info_when_show_traces_is_enabled() -> None:
    record = _make_record_with_exc_info()

    result = TracebackFilter(show_traces=True).filter(record)

    assert result is True
    assert record.exc_info is not None


def _log_settings(*, level: str = "INFO", show_traces: bool) -> LogSettings:
    return LogSettings(
        level=level,
        show_traces=show_traces,
        logfire=LogfireSettings(enabled=False, token="", environment=LogfireEnvironment.TEST),
    )


def test_configure_logging_attaches_a_single_traceback_filter_per_handler() -> None:
    configure_logging(_log_settings(show_traces=False))
    configure_logging(_log_settings(show_traces=True))

    root_logger = logging.getLogger()
    assert len(root_logger.handlers) == 1
    for handler in root_logger.handlers:
        traceback_filters = [f for f in handler.filters if isinstance(f, TracebackFilter)]
        assert len(traceback_filters) == 1
        assert traceback_filters[0].show_traces is True


def test_configure_logging_applies_the_configured_level() -> None:
    configure_logging(_log_settings(level="INFO", show_traces=False))
    assert logging.getLogger().getEffectiveLevel() == logging.INFO

    configure_logging(_log_settings(level="DEBUG", show_traces=False))
    assert logging.getLogger().getEffectiveLevel() == logging.DEBUG


def test_configure_logging_does_not_attach_logfire_handler_when_disabled() -> None:
    configure_logging(_log_settings(show_traces=False))

    root_logger = logging.getLogger()
    logfire_handlers = [h for h in root_logger.handlers if isinstance(h, logfire.LogfireLoggingHandler)]
    assert len(logfire_handlers) == 0


def test_configure_logging_attaches_warning_and_above_logfire_handler_when_enabled() -> None:
    settings = LogSettings(
        level="INFO",
        show_traces=False,
        logfire=LogfireSettings(enabled=True, token="", environment=LogfireEnvironment.TEST),
    )

    configure_logging(settings)

    root_logger = logging.getLogger()
    logfire_handlers = [h for h in root_logger.handlers if isinstance(h, logfire.LogfireLoggingHandler)]
    assert len(logfire_handlers) == 1
    assert logfire_handlers[0].level == logging.WARNING
