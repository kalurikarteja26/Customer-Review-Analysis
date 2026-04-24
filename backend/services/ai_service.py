import os
import json
import re
from typing import List, Dict

# Mocking Gemini for now as we don't have API key provided in context
# In a real scenario, we would use google-generativeai

def optimize_query(query: str) -> str:
    # Logic to convert query to keywords
    # "phone under 15000 good battery" -> "best phone under 15000 battery life"
    query = query.lower()
    keywords = query
    if "under" in query:
        keywords = query.replace("good", "").replace("best", "").strip()
        keywords = f"best {keywords}"
    
    # Simple rule-based keyword extraction
    return keywords

def calculate_feature_match_score(reviews: List[Dict], user_query: str) -> Dict[str, float]:
    # Extract features from query
    common_features = [
        "battery", "camera", "durability", "comfort", "performance", 
        "build quality", "fit", "size", "material", "heating", 
        "charging", "sound quality", "display", "design"
    ]
    
    requested_features = [f for f in common_features if f in user_query.lower()]
    if not requested_features:
        # Default features based on category if needed, or just common ones
        requested_features = ["performance", "quality", "value"]

    scores = {}
    for feature in requested_features:
        pos_mentions = 0
        total_mentions = 0
        for review in reviews:
            text = review.get('text', '').lower()
            if feature in text:
                total_mentions += 1
                # Simple sentiment check for the feature
                if any(pos in text for pos in ['good', 'great', 'excellent', 'amazing', 'best', 'nice']):
                    pos_mentions += 1
                elif any(neg in text for neg in ['bad', 'poor', 'worst', 'terrible', 'issue', 'problem']):
                    pass # Negative mention
        
        if total_mentions > 0:
            scores[feature] = round((pos_mentions / total_mentions) * 100, 2)
        else:
            scores[feature] = 0.0 # Or skip
            
    return scores

def generate_recommendation(data: Dict) -> Dict:
    sentiment_score = data.get('sentiment_analysis', {}).get('sentiment_score', 0) # Assumed range -1 to 1 or 0 to 100
    # Normalize sentiment to 0-100 if it's -1 to 1
    if -1 <= sentiment_score <= 1:
        sentiment_score = (sentiment_score + 1) * 50
        
    rating = float(data.get('rating') or 0) * 20 # 0-100 scale
    feature_match_scores = data.get('feature_match_scores', {})
    avg_feature_match = sum(feature_match_scores.values()) / len(feature_match_scores) if feature_match_scores else 50
    
    # Calculate final score
    final_score = (sentiment_score * 0.4) + (rating * 0.3) + (avg_feature_match * 0.3)
    
    verdict = "CONSIDER"
    if final_score > 75:
        verdict = "BUY"
    elif final_score < 40:
        verdict = "NOT RECOMMENDED"
        
    # Generate badges
    badges = []
    if rating > 80: badges.append("Highly Rated")
    if final_score > 85: badges.append("Best Match")
    if "price" in data and float(str(data['price']).replace(',', '')) < 5000: badges.append("Budget Friendly")
    
    return {
        "verdict": verdict,
        "score": round(final_score, 2),
        "badges": badges,
        "insights": {
            "pros": data.get('sentiment_analysis', {}).get('positive_highlights', [])[:3],
            "cons": data.get('sentiment_analysis', {}).get('negative_highlights', [])[:3]
        }
    }
