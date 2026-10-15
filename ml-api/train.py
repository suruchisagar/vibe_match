import pandas as pd
from sentence_transformers import SentenceTransformer
import pickle
import os

# 1. Load the new dataset
file_name = 'vibe_movies_dataset.csv' 

if not os.path.exists(file_name):
    print(f"Error: '{file_name}' nahi mili!")
else:
    print(f"1. Loading {file_name}...")
    # Encoding error se bachne ke liye encoding='utf-8' ya 'latin-1' use karein
    # df = pd.read_csv(file_name, encoding='latin-1')
    # train.py mein ye line update karein
    df = pd.read_csv(file_name, encoding='latin-1', on_bad_lines='skip') 
    df = df.fillna('')

    print("2. Preparing the 'Deep Vibe' string...")
    # Hum Title + Plot + Reviews ko mila rahe hain taaki AI ko movie ki poori samajh ho
    df['vibe_text'] = df['title'].astype(str) + " " + df['plot'].astype(str) + " " + df['reviews'].astype(str)

    # Cleanup duplicates
    df = df.drop_duplicates(subset=['title']).reset_index(drop=True)

    print("3. Booting up NLP Transformer (MiniLM)...")
    model = SentenceTransformer('all-MiniLM-L6-v2')

    print("4. Generating Dense Vectors (Please wait)...")
    embeddings = model.encode(df['vibe_text'].tolist(), show_progress_bar=True)

    print("5. Saving the Brain...")
    # 'movies_dict.pkl' mein pura dataframe (title, plot, reviews) save kar rahe hain
    pickle.dump(df.to_dict(), open('movies_dict.pkl', 'wb'))
    pickle.dump(embeddings, open('movie_embeddings.pkl', 'wb'))

    print(" SUCCESS! Naya brain trained ho gaya hai.")