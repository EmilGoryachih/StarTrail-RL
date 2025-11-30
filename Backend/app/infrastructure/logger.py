from __future__ import annotations

import logging
import sys

from loguru import logger


class InterceptHandler(logging.Handler):
    def emit(self, record: logging.LogRecord) -> None:  # pragma: no cover - thin wrapper
        try:
            level = logger.level(record.levelname).name
        except ValueError:
            level = record.levelno
        logger.log(level, record.getMessage())


def setup_logger() -> None:
    logger.remove()
    logger.add("app.log", rotation="10 MB", level="INFO")
    logger.add(sys.stdout, level="INFO")

    logging.basicConfig(handlers=[InterceptHandler()], level=logging.INFO, force=True)


setup_logger()

# Export configured logger
__all__ = ["logger"]
