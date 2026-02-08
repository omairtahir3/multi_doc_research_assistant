# backend/qa.py
from transformers import pipeline
import torch

class QuestionAnswering:
    def __init__(self, retriever):
        self.retriever = retriever
        
        print("Loading QA model...")
        self.qa_pipeline = pipeline(
            "question-answering",
            model="deepset/roberta-base-squad2",
            device=0 if torch.cuda.is_available() else -1
        )
        print("QA model loaded!")
    
    def answer_question(self, question: str):
        # Retrieve relevant chunks
        docs = self.retriever.retrieve(question, top_k=10)
        
        if not docs:
            return "No relevant documents found.", []
        
        print(f"\n{'='*70}")
        print(f"Question: {question}")
        print(f"Retrieved {len(docs)} chunks\n")
        
        # Try to answer from each chunk
        answers = []
        
        for i, doc in enumerate(docs):
            context = doc['text']
            
            # Limit context to model's capacity
            max_words = 400
            words = context.split()
            if len(words) > max_words:
                context = " ".join(words[:max_words])
            
            try:
                result = self.qa_pipeline(
                    question=question,
                    context=context,
                    max_answer_len=200
                )
                
                answer_text = result['answer'].strip()
                score = result['score']
                
                # Accept any answer with reasonable confidence
                if score > 0.01 and len(answer_text) > 3:
                    answers.append({
                        'answer': answer_text,
                        'score': score,
                        'source': doc.get('source', 'unknown'),
                        'page': doc.get('page', 'N/A')
                    })
                    print(f"  Chunk {i+1}: Score {score:.4f} - {answer_text[:80]}...")
                    
            except Exception as e:
                continue
        
        if not answers:
            return "I couldn't find an answer in the documents.", []
        
        # Return highest confidence answer
        answers.sort(key=lambda x: x['score'], reverse=True)
        best_answer = answers[0]['answer']
        sources = list(set([a['source'] for a in answers[:3]]))
        
        print(f"\nBest answer (confidence: {answers[0]['score']:.4f}):")
        print(f"{best_answer}")
        print(f"{'='*70}\n")
        
        return best_answer, sources