import re

def detect_fake_review(text: str, rating: float):
    probability = 0.0
    
    if not text:
        return {"fake_probability": 0.5}
    
    # Rule 1: Very short reviews
    if len(text.split()) < 5:
        probability += 0.3
        
    # Rule 2: Repeated words
    words = text.lower().split()
    if len(words) > 0:
        unique_words = set(words)
        repetition_ratio = 1 - (len(unique_words) / len(words))
        if repetition_ratio > 0.4:
            probability += 0.4
            
    # Rule 3: Extreme ratings without much explanation
    if (rating >= 5 or rating <= 1) and len(text.split()) < 10:
        probability += 0.2
        
    # Rule 4: Excessive punctuation
    punctuation_count = len(re.findall(r'[!!??]', text))
    if punctuation_count > 5:
        probability += 0.2
        
    # Rule 5: Generic marketing words
    marketing_words = ["best", "buy", "amazing", "quality", "product", "recommend"]
    marketing_hits = sum(1 for word in marketing_words if word in text.lower())
    if marketing_hits > 3:
        probability += 0.1

    return {
        "fake_probability": min(1.0, round(probability, 2))
    }
