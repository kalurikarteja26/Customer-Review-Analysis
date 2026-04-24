from .amazon_scraper import AmazonScraper
from .flipkart_scraper import FlipkartScraper
from .snapdeal_scraper import SnapdealScraper
from .croma_scraper import CromaScraper
from .ajio_scraper import AjioScraper

PLATFORM_MAP = {
    "amazon": AmazonScraper,
    "flipkart": FlipkartScraper,
    "snapdeal": SnapdealScraper,
    "croma": CromaScraper,
    "ajio": AjioScraper
}
