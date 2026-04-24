from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class Review(BaseModel):
    author: Optional[str] = "Anonymous"
    rating: Optional[float] = 0.0
    text: Optional[str] = ""
    date: Optional[str] = ""
    verified: Optional[bool] = False
    sentiment_score: Optional[float] = 0.0
    sentiment_label: Optional[str] = "neutral"
    fake_probability: Optional[float] = 0.0

class Recommendation(BaseModel):
    verdict: Optional[str] = "CONSIDER"
    score: Optional[int] = 0
    badges: Optional[List[str]] = []
    insights: Optional[Dict[str, List[str]]] = {"pros": [], "cons": []}

class Product(BaseModel):
    id: Optional[str] = ""
    title: Optional[str] = ""
    price: Optional[str] = ""
    original_price: Optional[str] = ""
    discount_percentage: Optional[int] = 0
    currency: Optional[str] = "INR"
    rating: Optional[float] = 0.0
    review_count: Optional[int] = 0
    image: Optional[str] = ""
    images: Optional[List[str]] = []
    feature_images: Optional[List[str]] = []
    features: Optional[List[str]] = []
    specifications: Optional[Dict[str, str]] = {}
    stock: Optional[str] = "Unknown"
    platform: Optional[str] = ""
    url: Optional[str] = ""
    reviews: Optional[List[Review]] = []
    sentiment_analysis: Optional[Dict[str, Any]] = {}
    feature_match_scores: Optional[Dict[str, int]] = {}
    rating_distribution: Optional[Dict[int, int]] = {5: 0, 4: 0, 3: 0, 2: 0, 1: 0}
    price_history: Optional[List[Dict[str, Any]]] = []
    recommendation: Optional[Recommendation] = None
    is_best_product: Optional[bool] = False

class AnalysisRequest(BaseModel):
    url: str
    category: Optional[str] = "General"

class SearchRequest(BaseModel):
    query: str
    category: Optional[str] = "General"

class ComparisonRequest(BaseModel):
    urls: List[str]

class SearchResponse(BaseModel):
    status: str = "success"
    query: str = ""
    products: List[Product] = []
    best_product: Optional[Product] = None

class AnalysisResponse(BaseModel):
    status: str = "success"
    product: Optional[Product] = None
    recommendation: Optional[Recommendation] = None

class ComparisonResponse(BaseModel):
    status: str = "success"
    comparison: List[Product] = []
