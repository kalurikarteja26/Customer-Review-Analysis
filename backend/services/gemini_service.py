import google.generativeai as genai
import os
from typing import List, Dict, Any
from dotenv import load_dotenv

load_dotenv()

class GeminiAIService:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-pro')
            self.active = True
        else:
            self.active = False
            print("WARNING: GEMINI_API_KEY not found. AI features will use fallback logic.")

    def summarize_reviews(self, reviews: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not self.active or not reviews:
            return None
        
        try:
            review_text = "\n".join([f"- {r.get('text', '')}" for r in reviews[:15]])
            prompt = f"""
            Analyze these customer reviews for a product and provide:
            1. 3 concise positive highlights.
            2. 3 concise negative highlights (if any).
            3. A 2-sentence overall sentiment summary.

            Reviews:
            {review_text}

            Return ONLY a JSON object with keys: "positive_highlights", "negative_highlights", "overall_summary".
            """
            response = self.model.generate_content(prompt)
            import json
            # Clean response text in case of markdown blocks
            text = response.text.replace('```json', '').replace('```', '').strip()
            return json.loads(text)
        except Exception as e:
            print(f"Gemini Summary Error: {e}")
            return None

    def generate_verdict(self, product_info: Dict[str, Any], reviews: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not self.active:
            return None
            
        try:
            prompt = f"""
            Act as a professional shopping consultant. Based on this product:
            Name: {product_info.get('name')}
            Price: {product_info.get('price')}
            Rating: {product_info.get('rating')}
            Reviews: {str([r.get('text') for r in reviews[:5]])}

            Give a final verdict: "BUY", "CONSIDER", or "NOT RECOMMENDED".
            Also provide 2 pros, 2 cons, and a total score (0-100).

            Return ONLY a JSON object with keys: "verdict", "score", "pros", "cons".
            """
            response = self.model.generate_content(prompt)
            import json
            text = response.text.replace('```json', '').replace('```', '').strip()
            return json.loads(text)
        except Exception as e:
            print(f"Gemini Verdict Error: {e}")
            return None

    def rank_canonical_products(self, products_summary: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Takes a list of lightweight canonical product summaries and asks Gemini to pick the ultimate best.
        Returns a dictionary mapping product IDs to their AI scores and badges.
        """
        if not self.active or not products_summary:
            return None
            
        try:
            prompt = f"""
            Act as an expert shopping AI. You are presented with a list of grouped product options for a user's search.
            Your task is to analyze these options based on their price, average rating, review counts, and platforms to determine the absolute BEST OVERALL product to buy.
            
            Products:
            {products_summary}
            
            Rules:
            1. Assign a "total_score" (0-100) to each product.
            2. Assign exactly 1 or 2 short, catchy "badges" (e.g. "AI Top Pick", "Best Value", "Premium Choice") to each product based on its stats.
            3. Choose EXACTLY ONE product to have "is_best_product": true. All others must be false.
            
            Return ONLY a valid JSON object where the keys are the Product IDs, and the values are objects containing "total_score", "badges", and "is_best_product".
            Example Format:
            {{
                "id123": {{"total_score": 95, "badges": ["AI Top Pick", "Best Value"], "is_best_product": true}},
                "id456": {{"total_score": 70, "badges": ["Budget Option"], "is_best_product": false}}
            }}
            """
            response = self.model.generate_content(prompt)
            import json
            text = response.text.replace('```json', '').replace('```', '').strip()
            return json.loads(text)
        except Exception as e:
            print(f"Gemini Ranking Error: {e}")
            return None
