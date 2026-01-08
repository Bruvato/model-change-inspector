from sentence_transformers import SentenceTransformer


class ComparisonService:
    def __init__(self):
        self.model = SentenceTransformer('all-MiniLM-L6-v2')

    def calculate_similarity(self, text1: str, text2: str) -> float:
        embeddings = self.model.encode([text1, text2])
        similarity = self.model.similarity(embeddings[0], embeddings[1])[0][0]

        return float(similarity)
    
    def analyze_diff(self, text1: str, text2: str) -> dict:
        return {
            "length_diff": len(text2) - len(text1),
            "word_count_diff": len(text2.split()) - len(text1.split()),
            "similarity": self.calculate_similarity(text1, text2),
        }
    
