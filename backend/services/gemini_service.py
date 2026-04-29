"""
Gemini AI Service — uses the new google-genai SDK.
Provides: review summarization, product verdict, and canonical ranking.
"""
import os
import json
from typing import List, Dict, Any
from dotenv import load_dotenv

load_dotenv()

class GeminiAIService:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        self.active = False
        self.client = None
        self.model_name = "gemini-2.0-flash"

        if api_key and api_key != "your_real_api_key_here":
            try:
                from google import genai
                self.client = genai.Client(api_key=api_key)
                self.active = True
                print(f"[GeminiAI] Initialized with model={self.model_name}")
            except Exception as e:
                print(f"WARNING: Failed to initialize Gemini: {e}")
        else:
            print("WARNING: GEMINI_API_KEY not found or is placeholder. AI features will use fallback logic.")

    def _generate(self, prompt: str) -> str:
        """Core generation method with error handling."""
        if not self.active or not self.client:
            return None
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt
            )
            return response.text
        except Exception as e:
            print(f"Gemini API Error: {e}")
            return None

    def _parse_json(self, text: str) -> dict:
        """Safely parse JSON from Gemini's response."""
        if not text:
            return None
        try:
            text = text.replace('```json', '').replace('```', '').strip()
            start = text.find('{')
            end = text.rfind('}') + 1
            if start != -1 and end > 0:
                text = text[start:end]
            return json.loads(text)
        except Exception as e:
            print(f"Gemini JSON Parse Error: {e}")
            return None

    def summarize_reviews(self, reviews: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not self.active or not reviews:
            return None

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
        for attempt in range(2):
            raw = self._generate(prompt)
            data = self._parse_json(raw)
            if data and "positive_highlights" in data and "overall_summary" in data:
                return data
            print(f"Gemini Summary retry {attempt+1}")
        return None

    def generate_verdict(self, product_info: Dict[str, Any], reviews: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not self.active:
            return None

        prompt = f"""
        Act as a professional shopping consultant. Based on this product:
        Name: {product_info.get('name') or product_info.get('title')}
        Price: {product_info.get('price')}
        Rating: {product_info.get('rating')}
        Reviews: {str([r.get('text') for r in reviews[:5]])}

        Give a final verdict: "BUY", "CONSIDER", or "NOT RECOMMENDED".
        Also provide 2 pros, 2 cons, and a total score (0-100).

        Return ONLY a JSON object with keys: "verdict", "score", "pros", "cons".
        """
        for attempt in range(2):
            raw = self._generate(prompt)
            data = self._parse_json(raw)
            if data and "verdict" in data and "score" in data:
                return data
            print(f"Gemini Verdict retry {attempt+1}")
        return None

    def rank_canonical_products(self, products_summary: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Takes a list of lightweight canonical product summaries and asks Gemini to pick the ultimate best.
        Returns a dictionary mapping product IDs to their AI scores and badges.
        """
        if not self.active or not products_summary:
            return None

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
        for attempt in range(2):
            raw = self._generate(prompt)
            data = self._parse_json(raw)
            if data:
                return data
            print(f"Gemini Ranking retry {attempt+1}")
        return None
