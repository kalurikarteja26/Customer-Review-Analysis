from typing import List, Dict, Any

class AIRecommendationService:
    def calculate_scores(self, product_data: Dict[str, Any], query: str = "") -> Dict[str, Any]:
        reviews = product_data.get("reviews", [])
        total_reviews = len(reviews)
        
        # 1. Sentiment Score (0-100) based on positive review ratio
        positive_reviews = [r for r in reviews if r.get("sentiment_label") == "positive" or r.get("rating", 0) >= 4]
        sentiment_ratio = len(positive_reviews) / total_reviews if total_reviews > 0 else 0.5
        sentiment_score = int(sentiment_ratio * 100)
        
        # 2. Feature Match Score (0-100)
        query_words = set(query.lower().split())
        content = (product_data.get("name", "") + " " + " ".join(product_data.get("features", []))).lower()
        match_count = sum(1 for word in query_words if word in content)
        feature_match_score = int((match_count / len(query_words)) * 100) if query_words else 80
        
        # 3. Negative Issue Score
        negative_reviews = [r for r in reviews if r.get("sentiment_label") == "negative" or r.get("rating", 0) <= 2]
        negative_issue_score = int((len(negative_reviews) / total_reviews) * 100) if total_reviews > 0 else 0
        
        # 4. Popularity Score
        review_count = product_data.get("review_count", 0)
        popularity_score = min(100, int((review_count / 1000) * 100))
        
        # 5. Weighted Total Score (Truly Dynamic)
        # We value: High Sentiment, Low Negative Issues, Good Feature Match, and Popularity
        total_score = int(
            (sentiment_score * 0.45) + 
            (feature_match_score * 0.15) + 
            ((100 - negative_issue_score) * 0.30) + 
            (popularity_score * 0.10)
        )

        return {
            "sentiment": sentiment_score,
            "feature_match": feature_match_score,
            "negative_issues": negative_issue_score,
            "popularity": popularity_score,
            "total_score": total_score
        }

    def generate_recommendation(self, scores: Dict[str, int]) -> Dict[str, Any]:
        total_score = scores.get("total_score", 0)
        
        if total_score > 70:
            verdict = "BUY"
            badges = ["Highly Recommended", "Top Choice"]
        elif total_score > 40:
            verdict = "CONSIDER"
            badges = ["Balanced Choice", "Consider Alternatives"]
        else:
            verdict = "NOT RECOMMENDED"
            badges = ["Potential Issues", "Low Satisfaction"]
            
        return {
            "verdict": verdict,
            "score": total_score,
            "badges": badges,
            "insights": {
                "pros": ["High aggregate quality" if total_score > 70 else "Niche market appeal"],
                "cons": ["Identified user risks" if scores["negative_issues"] > 30 else "Minimal negative feedback"]
            }
        }

    def identify_best_product(self, products: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not products: return None
        # Sort by total score if available
        sorted_products = sorted(products, key=lambda x: x.get("recommendation", {}).get("score", 0), reverse=True)
        return sorted_products[0] if sorted_products else None
