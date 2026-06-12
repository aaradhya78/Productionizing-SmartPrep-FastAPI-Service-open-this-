import re
import logging
from collections import Counter
from typing import List, Dict, Any

logger = logging.getLogger("ai_service")

# Common English stopwords
STOPWORDS = set([
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't", "as", "at",
    "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "can", "can't", "cannot",
    "could", "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during", "each", "few",
    "for", "from", "further", "had", "hadn't", "has", "hasn't", "have", "haven't", "having", "he", "he'd", "he'll",
    "he's", "her", "here", "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i", "i'd", "i'll",
    "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's", "its", "itself", "let's", "me", "more", "most",
    "mustn't", "my", "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our",
    "ours", "ourselves", "out", "over", "own", "same", "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't",
    "so", "some", "such", "than", "that", "that's", "the", "their", "theirs", "them", "themselves", "then", "there",
    "there's", "these", "they", "they'd", "they'll", "they're", "they've", "this", "those", "through", "to", "too",
    "under", "until", "up", "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were", "weren't", "what",
    "what's", "when", "when's", "where", "where's", "which", "while", "who", "who's", "whom", "why", "why's", "with",
    "won't", "would", "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself", "yourselves"
])

# Attempt to load spaCy
SPACY_AVAILABLE = False
nlp = None
try:
    import spacy
    try:
        nlp = spacy.load("en_core_web_sm")
        SPACY_AVAILABLE = True
        logger.info("spaCy loaded successfully.")
    except OSError:
        logger.warning("spaCy en_core_web_sm model not found. spaCy features disabled.")
except Exception as e:
    logger.warning(f"Failed to load spaCy due to import error: {e}. Falling back to Pure Python NLP.")

def extract_nlp_metadata(text: str) -> Dict[str, List[Dict[str, Any]]]:
    """
    Extract topics, concepts, and keywords from document text.
    Returns:
    {
      "topics": [{"name": str, "score": float}],
      "concepts": [{"name": str, "score": float}],
      "keywords": [{"name": str, "score": float}]
    }
    """
    if not text:
        return {"topics": [], "concepts": [], "keywords": []}
        
    if SPACY_AVAILABLE and nlp:
        try:
            return extract_using_spacy(text)
        except Exception as e:
            logger.error(f"spaCy extraction failed: {e}. Falling back to Pure Python.")
            return extract_using_pure_python(text)
    else:
        return extract_using_pure_python(text)

def extract_using_spacy(text: str) -> Dict[str, List[Dict[str, Any]]]:
    """NLP processing using spaCy."""
    # Limit text size to prevent memory issues
    doc_text = text[:100000] 
    doc = nlp(doc_text)
    
    # 1. Keywords: Single nouns, adjectives, or proper nouns (excluding stop words)
    words = []
    for token in doc:
        if token.is_alpha and not token.is_stop and token.pos_ in ["NOUN", "PROPN", "ADJ"]:
            words.append(token.lemma_.lower())
            
    word_counts = Counter(words)
    total_words = sum(word_counts.values()) or 1
    keywords = [
        {"name": word, "score": round(count / total_words * 100, 2)}
        for word, count in word_counts.most_common(15)
    ]
    
    # 2. Concepts: Noun chunks/phrases
    concepts_list = []
    for chunk in doc.noun_chunks:
        # Clean the chunk text (remove stop words at the beginning, like articles)
        chunk_clean = " ".join([t.text.lower() for t in chunk if not t.is_stop and t.is_alpha])
        if len(chunk_clean.split()) >= 2:  # Multi-word concepts
            concepts_list.append(chunk_clean)
            
    concept_counts = Counter(concepts_list)
    total_concepts = sum(concept_counts.values()) or 1
    concepts = [
        {"name": concept, "score": round(count / total_concepts * 100, 2)}
        for concept, count in concept_counts.most_common(12)
    ]
    
    # 3. Topics: Proper nouns, entities, or very high-frequency concepts
    entities = [ent.text.strip().lower() for ent in doc.ents if ent.label_ in ["ORG", "PRODUCT", "WORK_OF_ART", "GPE", "LAW"]]
    # Combine entities with high frequency noun-phrase heads
    high_freq_nouns = [token.text.lower() for token in doc if token.pos_ in ["PROPN"] and not token.is_stop]
    
    topics_list = entities + high_freq_nouns
    topic_counts = Counter(topics_list)
    total_topics = sum(topic_counts.values()) or 1
    topics = [
        {"name": topic, "score": round(count / total_topics * 100, 2)}
        for topic, count in topic_counts.most_common(10)
    ]
    
    return {
        "topics": topics,
        "concepts": concepts,
        "keywords": keywords
    }

def extract_using_pure_python(text: str) -> Dict[str, List[Dict[str, Any]]]:
    """Fallback NLP processing in pure Python without spaCy."""
    text_lower = text.lower()
    
    # Clean text to words
    words_all = re.findall(r"\b[a-z]{3,20}\b", text_lower)
    words_filtered = [w for w in words_all if w not in STOPWORDS]
    
    # 1. Keywords
    word_counts = Counter(words_filtered)
    total_words = sum(word_counts.values()) or 1
    keywords = [
        {"name": word, "score": round(count / total_words * 100, 2)}
        for word, count in word_counts.most_common(15)
    ]
    
    # 2. Concepts: Extract 2-word and 3-word combinations
    bigrams = []
    for i in range(len(words_filtered) - 1):
        bigrams.append(f"{words_filtered[i]} {words_filtered[i+1]}")
        
    bigram_counts = Counter(bigrams)
    total_bigrams = sum(bigram_counts.values()) or 1
    concepts = [
        {"name": bg, "score": round(count / total_bigrams * 100, 2)}
        for bg, count in bigram_counts.most_common(12)
    ]
    
    # 3. Topics: Capitalized sequences (Proper nouns like "Relational Database", "Quick Sort")
    capitalized_phrases = []
    # Match sequences of capitalized words in the original text
    cap_matches = re.findall(r"\b([A-Z][a-zA-Z]{2,15}(?:\s+[A-Z][a-zA-Z]{2,15})+)\b", text)
    for match in cap_matches:
        capitalized_phrases.append(match.strip().lower())
        
    # If no capitalized phrases found, fallback to top keywords
    if not capitalized_phrases:
        topics = [
            {"name": k["name"].title(), "score": k["score"]}
            for k in keywords[:8]
        ]
    else:
        topic_counts = Counter(capitalized_phrases)
        total_topics = sum(topic_counts.values()) or 1
        topics = [
            {"name": topic.title(), "score": round(count / total_topics * 100, 2)}
            for topic, count in topic_counts.most_common(10)
        ]
        
    return {
        "topics": topics,
        "concepts": concepts,
        "keywords": keywords
    }
