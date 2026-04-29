import os
from celery import Celery
from backend.services.sentiment_service import analyze_sentiment
from backend.services.fake_review_detector import detect_fake_review
from backend.services.gemini_service import GeminiAIService

redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "sentix_tasks",
    broker=redis_url,
    backend=redis_url
)

celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
)

gemini = GeminiAIService()

@celery_app.task
def process_review_task(review_text: str, rating: float):
    """Run sentiment and fake review detection in background."""
    sent = analyze_sentiment(review_text)
    fake = detect_fake_review(review_text, rating)
    return {
        "sentiment_score": sent.get("sentiment_score", 0.0),
        "sentiment_label": sent.get("sentiment_label", "neutral"),
        "fake_probability": fake.get("fake_probability", 0.0)
    }

@celery_app.task
def summarize_reviews_task(reviews: list):
    """Run Gemini summarization in background."""
    return gemini.summarize_reviews(reviews)

@celery_app.task
def generate_verdict_task(product_info: dict, reviews: list):
    """Run Gemini verdict generation in background."""
    return gemini.generate_verdict(product_info, reviews)
