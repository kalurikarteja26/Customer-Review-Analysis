"""
Improved sentiment analysis using VADER + TextBlob ensemble.
Returns a confidence score alongside the label.
"""
from textblob import TextBlob
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

vader = SentimentIntensityAnalyzer()

def analyze_sentiment(text: str) -> dict:
    if not text or not text.strip():
        return {"sentiment_score": 0.0, "sentiment_label": "neutral", "confidence": 0.5}

    # VADER score (-1 to 1)
    vader_compound = vader.polarity_scores(text)["compound"]

    # TextBlob polarity (-1 to 1)
    try:
        tb_polarity = TextBlob(text).sentiment.polarity
    except Exception:
        tb_polarity = 0.0

    # Ensemble: weighted average (VADER is stronger for social text)
    combined = (vader_compound * 0.65) + (tb_polarity * 0.35)

    # Agreement-based confidence: high when both models agree
    agreement = 1.0 - abs(vader_compound - tb_polarity) / 2.0
    confidence = round(max(0.4, min(1.0, agreement)), 2)

    # Label
    if combined >= 0.08:
        label = "positive"
    elif combined <= -0.08:
        label = "negative"
    else:
        label = "neutral"

    return {
        "sentiment_score": round(combined, 3),
        "sentiment_label": label,
        "confidence": confidence
    }
