from flask import Flask, request, jsonify
from flask_cors import CORS
import time
import random

app = Flask(__name__)
# Enable CORS for the Vite local development server
CORS(app, resources={r"/*": {"origins": "*"}})

@app.route('/analyze', methods=['POST'])
def analyze_sentiment():
    """
    Mock endpoint that simulates a Machine Learning classification result.
    In a fully production scenario, we would interface with a 
    pre-loaded Scikit-Learn or Transformer model here.
    """
    data = request.json
    if not data or 'text' not in data:
        return jsonify({"error": "No text provided"}), 400

    text = data['text'].lower()
    
    # 1. Text preprocessing simulation: remove some noise
    # (Mock implementation)

    # 2. Simulate ML inference duration based on model complexity (~800ms)
    time.sleep(0.8)
    
    # Simple heuristic to act as the "mock model" and ensure our UI 
    # responds logically to obvious words until real model is hooked up
    positive_words = ['great', 'excellent', 'good', 'amazing', 'love', 'perfect']
    negative_words = ['bad', 'terrible', 'awful', 'hate', 'poor', 'worst', 'broken']
    
    score = 0
    keywords = set()
    
    # Very basic entity extraction simulation
    tech_entities = ['screen', 'battery', 'ui', 'interface', 'camera', 'design', 'weight']
    for entity in tech_entities:
        if entity in text:
            keywords.add(entity.capitalize())

    for w in positive_words:
        if w in text:
            score += 1
            keywords.add(w)
    for w in negative_words:
        if w in text:
            score -= 1
            keywords.add(w)

    # Determine confidence (simulate bayesian probability output)
    base_confidence = 0.65
    confidence_modifier = min(abs(score) * 0.1, 0.3)
    final_confidence = round(base_confidence + confidence_modifier + random.uniform(-0.05, 0.04), 2)
    final_confidence = min(final_confidence, 0.99) # Cap at 99%
    
    # Categorize Sentiment
    sentiment_label = "Neutral"
    if score > 0:
        sentiment_label = "Positive"
    elif score < 0:
        sentiment_label = "Negative"
        
    # Check for sarcasm condition (very basic heuristics)
    if ("love" in text or "great" in text) and ("but" in text or "except" in text) and score < 0:
         sentiment_label = "Sarcastic"

    # Assemble "Aspect-Based" Analysis Mock
    # Randomly generate based on polarity to simulate specific features.
    
    def get_rating(pol):
        if pol == 'Positive': return random.randint(4, 5)
        if pol == 'Negative': return random.randint(1, 2)
        return random.randint(2, 4)

    aspects = {
        "Build Quality": get_rating(sentiment_label),
        "Value For Money": get_rating(sentiment_label) if score != 0 else 3,
        "Daily Usage": get_rating(sentiment_label) if random.random() > 0.5 else 3
    }
    
    # Return matched API payload
    response = {
        "sentiment": sentiment_label,
        "confidence": final_confidence,
        "keywords": list(keywords)[:5] if keywords else ["Device", "General"],
        "aspects": aspects
    }

    return jsonify(response)

if __name__ == '__main__':
    # Run the server on port 5000
    app.run(debug=True, port=5000)
