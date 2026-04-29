"""
Structured logger for Sentix-Prime.
All scrape/API events go through here for observability.
"""
import logging
import time
import os
from datetime import datetime

LOG_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "logs")
os.makedirs(LOG_DIR, exist_ok=True)

# Root logger config
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    handlers=[
        logging.FileHandler(os.path.join(LOG_DIR, "sentix.log"), encoding="utf-8"),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger("sentix")

def log_search(query: str, platform_count: int, result_count: int, duration_ms: float):
    logger.info(f"SEARCH query={query!r} platforms={platform_count} results={result_count} duration={duration_ms:.0f}ms")

def log_scrape(url: str, platform: str, success: bool, duration_ms: float, error: str = None):
    if success:
        logger.info(f"SCRAPE platform={platform} url={url[:70]} duration={duration_ms:.0f}ms OK")
    else:
        logger.warning(f"SCRAPE platform={platform} url={url[:70]} duration={duration_ms:.0f}ms FAIL error={error}")

def log_api(endpoint: str, status: int, duration_ms: float):
    level = logging.INFO if status < 400 else logging.WARNING
    logger.log(level, f"API endpoint={endpoint} status={status} duration={duration_ms:.0f}ms")

def log_error(context: str, error: Exception):
    logger.error(f"ERROR context={context} error={type(error).__name__}: {error}", exc_info=True)

class Timer:
    """Context manager to measure elapsed time in ms."""
    def __enter__(self):
        self._start = time.perf_counter()
        return self
    def __exit__(self, *args):
        self.ms = (time.perf_counter() - self._start) * 1000
