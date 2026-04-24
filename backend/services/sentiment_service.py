from textblob import TextBlob
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

vader_analyzer = SentimentIntensityAnalyzer()

def analyze_sentiment(text: str):
    if not text:
        return {"sentiment_score": 0.0, "sentiment_label": "neutral"}
    
    # Using VADER for better social/review sentiment
    vader_scores = vader_analyzer.polarity_scores(text)
    compound_score = vader_scores['compound'] # Range -1 to 1
    
    # Normalize to 0 to 1 if needed, but -1 to 1 is better for green/red
    
    label = "neutral"
    if compound_score >= 0.05:
        label = "positive"
    elif compound_score <= -0.05:
        label = "negative"
        
    return {
        "sentiment_score": round(compound_score, 2),
        "sentiment_label": label
    }
