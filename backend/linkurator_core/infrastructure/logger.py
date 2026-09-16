import logging
import sys

import logfire

from linkurator_core.infrastructure.config.settings import LogSettings

LOG_FORMAT = "[%(levelname)s] %(asctime)s: %(message)s"
LOG_DATE_FORMAT = "%Y-%m-%d %H:%M:%S"


class TracebackFilter(logging.Filter):
    """
    Strips exception tracebacks from log records unless show_traces is enabled.
    """

    def __init__(self, *, show_traces: bool) -> None:
        super().__init__()
        self.show_traces = show_traces

    def filter(self, record: logging.LogRecord) -> bool:
        if not self.show_traces:
            record.exc_info = None
            record.exc_text = None
        return True


def configure_logging(
        settings: LogSettings,
) -> None:
    """
    Configures the logging settings for the application.
    """
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(logging.Formatter(fmt=LOG_FORMAT, datefmt=LOG_DATE_FORMAT))
    handler.addFilter(TracebackFilter(show_traces=settings.show_traces))

    root_logger = logging.getLogger()
    for existing_handler in root_logger.handlers[:]:
        root_logger.removeHandler(existing_handler)
    root_logger.addHandler(handler)
    root_logger.setLevel(logging.getLevelNamesMapping()[settings.level.upper()])

    if settings.logfire.enabled:
        logfire.configure(
            token=settings.logfire.token,
            scrubbing=False,
            environment=settings.logfire.environment,
            service_name="linkurator",
        )

        logfire.instrument_pydantic_ai()

        root_logger.addHandler(logfire.LogfireLoggingHandler(level=logging.WARNING))
