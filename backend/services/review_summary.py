def generate_review_summary(reviews_with_sentiment):
    if not reviews_with_sentiment:
        return {
            "positive_highlights": [],
            "negative_highlights": [],
            "overall_summary": "No reviews available to summarize."
        }
    
    positives = [r for r in reviews_with_sentiment if r['sentiment_label'] == 'positive']
    negatives = [r for r in reviews_with_sentiment if r['sentiment_label'] == 'negative']
    
    # Sort by sentiment score intensity
    positives.sort(key=lambda x: x['sentiment_score'], reverse=True)
    negatives.sort(key=lambda x: x['sentiment_score'])
    
    pos_highlights = [r['text'][:100] + "..." for r in positives[:3]]
    neg_highlights = [r['text'][:100] + "..." for r in negatives[:3]]
    
    pos_count = len(positives)
    neg_count = len(negatives)
    total = len(reviews_with_sentiment)
    
    if pos_count > neg_count:
        summary = f"Overall, the product has a positive reception with {pos_count}/{total} positive reviews. "
    elif neg_count > pos_count:
        summary = f"The product has mixed to negative feedback, with {neg_count}/{total} customers expressing dissatisfaction. "
    else:
        summary = "The product has a neutral or balanced reception from customers. "
        
    if pos_highlights:
        summary += "Customers frequently praise the quality and performance. "
    if neg_highlights:
        summary += "However, some issues were noted regarding durability or delivery."

    return {
        "positive_highlights": pos_highlights,
        "negative_highlights": neg_highlights,
        "overall_summary": summary
    }
