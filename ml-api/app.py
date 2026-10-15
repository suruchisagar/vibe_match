from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv
import os
import pickle
import pandas as pd
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

# Settings ml-api/.env se load ho rahi hain
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env'))
PORT = int(os.getenv("PORT", "5000"))
MODEL_NAME = os.getenv("MODEL_NAME", "all-MiniLM-L6-v2")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Data
movies_dict = pickle.load(open('movies_dict.pkl', 'rb'))
movies_df = pd.DataFrame(movies_dict)
movie_embeddings = pickle.load(open('movie_embeddings.pkl', 'rb'))
nlp_model = SentenceTransformer(MODEL_NAME)

class RecommendRequest(BaseModel):
    prompt: Optional[str] = ""
    prompt1: Optional[str] = None
    prompt2: Optional[str] = None

class Movie(BaseModel):
    title: str
    plot: str

# Plain 'def' (not async) taaki FastAPI isse threadpool mein chalaye - encoding CPU-heavy hai
@app.post('/recommend', response_model=List[Movie])
def recommend(data: RecommendRequest):
    try:
        if data.prompt1 is not None and data.prompt2 is not None:
            vec1 = nlp_model.encode([data.prompt1])
            vec2 = nlp_model.encode([data.prompt2])
            target_vector = (vec1 + vec2) / 2.0
        else:
            target_vector = nlp_model.encode([data.prompt or ""])

        similarity_scores = cosine_similarity(target_vector, movie_embeddings)[0]
        movie_list = sorted(list(enumerate(similarity_scores)), reverse=True, key=lambda x: x[1])[0:5]

        results = []
        for i in movie_list:
            row = movies_df.iloc[i[0]]
            results.append({
                "title": str(row['title']),
                "plot": str(row['plot']) # Synopsis ke liye plot bhej rahe hain
            })
        return results
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

if __name__ == '__main__':
    import uvicorn
    uvicorn.run("app:app", port=PORT, reload=True)
