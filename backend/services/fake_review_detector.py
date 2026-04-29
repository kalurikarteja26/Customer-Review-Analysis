"""
Improved fake review detector with confidence scoring and
incentivized-review pattern detection.
"""
import re
from typing import Dict

# Patterns that strongly suggest incentivized / fake reviews
INCENTIVIZED_PATTERNS = [
    r"received (this|it|the product) (for free|at a discount|in exchange)",
    r"free (product|sample|item) (in exchange|for review)",
    r"given (for free|complimentary)",
    r"gifted (by|from) (the|this) (brand|company|seller)",
    r"disclosure[:\s]",
    r"complimentary (product|sample)",
    r"sponsored (post|review|content)",
    r"#ad\b",
    r"paid (review|promotion|partnership)",
]
_INCENTIVIZED_RE = [re.compile(p, re.IGNORECASE) for p in INCENTIVIZED_PATTERNS]

# Generic marketing word clusters (3+ from this list = suspicious)
MARKETING_WORDS = {
    "best", "amazing", "fantastic", "wonderful", "excellent", "perfect",
    "outstanding", "superb", "incredible", "awesome", "love", "recommend",
    "quality", "product", "buy", "purchase", "great", "good", "nice"
}


def detect_fake_review(text: str, rating: float) -> Dict[str, float]:
    try:
        rating = float(rating)
    except (TypeError, ValueError):
        rating = 0.0

    if not text or not text.strip():
        return {"fake_probability": 0.5, "confidence": 0.3}

    probability = 0.0
    words = text.lower().split()
    word_count = len(words)

    # Rule 1: Very short text (< 5 words)
    if word_count < 5:
        probability += 0.35

    # Rule 2: Repetition ratio — repeated words indicate bot-generated text
    if word_count > 0:
        unique_ratio = len(set(words)) / word_count
        if unique_ratio < 0.6:           # > 40% repeated words
            probability += 0.30

    # Rule 3: Extreme rating with minimal explanation
    if rating in (5.0, 1.0) and word_count < 10:
        probability += 0.20

    # Rule 4: Excessive exclamation/question marks
    punct_count = len(re.findall(r'[!?]', text))
    if punct_count > 4:
        probability += 0.15

    # Rule 5: Marketing word saturation (3+ hits)
    marketing_hits = sum(1 for w in MARKETING_WORDS if w in text.lower())
    if marketing_hits >= 4:
        probability += 0.15
    elif marketing_hits >= 3:
        probability += 0.08

    # Rule 6: Incentivized review patterns — very strong signal
    for pattern in _INCENTIVIZED_RE:
        if pattern.search(text):
            probability += 0.40
            break

    # Rule 7: ALL CAPS text
    alpha_chars = [c for c in text if c.isalpha()]
    if alpha_chars and sum(1 for c in alpha_chars if c.isupper()) / len(alpha_chars) > 0.6:
        probability += 0.15

    # Confidence: more rules triggered = more confident in the score
    rules_checked = 7
    probability = min(1.0, round(probability, 2))

    # Confidence is higher when probability is extreme (clearly fake or clearly real)
    confidence = round(0.5 + abs(probability - 0.5), 2)

    return {"fake_probability": probability, "confidence": confidence}
