import requests
from bs4 import BeautifulSoup
import pandas as pd
import time
import re

print(" Starting the MASSIVE VIBE FUSION Pipeline (Target: 2000+ Movies)...")

HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}

# List of Wikipedia pages to scrape (Aap aur bhi add kar sakte hain)
urls = [
    "https://en.wikipedia.org/wiki/List_of_science_fiction_films_of_the_2010s",
    "https://en.wikipedia.org/wiki/List_of_science_fiction_films_of_the_2000s",
    "https://en.wikipedia.org/wiki/List_of_action_films_of_the_2010s",
    "https://en.wikipedia.org/wiki/List_of_horror_films_of_the_2010s",
    "https://en.wikipedia.org/wiki/List_of_animated_feature_films_of_the_2010s"
]

def format_lb_url(title):
    clean_title = re.sub(r'[^\w\s-]', '', title).strip().lower()
    clean_title = re.sub(r'[-\s]+', '-', clean_title)
    return f"https://letterboxd.com/film/{clean_title}/"

movies_data = []

for page_url in urls:
    print(f"\n Scraping Page: {page_url.split('/')[-1]}")
    res = requests.get(page_url, headers=HEADERS)
    soup = BeautifulSoup(res.text, 'html.parser')
    tables = soup.find_all('table', class_='wikitable')
    
    for table in tables:
        rows = table.find_all('tr')
        for row in rows[1:]:
            cols = row.find_all(['td', 'th'])
            if len(cols) >= 2:
                a_tag = cols[0].find('a')
                if a_tag and 'href' in a_tag.attrs:
                    title = a_tag.text.strip()
                    wiki_url = "https://en.wikipedia.org" + a_tag['href']
                    
                    try:
                        # Part A: Wiki Plot
                        w_res = requests.get(wiki_url, headers=HEADERS)
                        w_soup = BeautifulSoup(w_res.text, 'html.parser')
                        plot_h = w_soup.find(id='Plot')
                        plot_text = ""
                        if plot_h:
                            for sib in plot_h.parent.find_next_siblings():
                                if sib.name == 'h2': break
                                if sib.name == 'p': plot_text += sib.text.strip() + " "
                        
                        # Part B: Letterboxd Reviews
                        lb_url = format_lb_url(title)
                        lb_res = requests.get(lb_url, headers=HEADERS)
                        rev_text = ""
                        if lb_res.status_code == 200:
                            lb_soup = BeautifulSoup(lb_res.text, 'html.parser')
                            revs = lb_soup.find_all('div', class_='body-text')
                            for r in revs[:2]: rev_text += r.text.strip() + " "
                        
                        if len(plot_text) > 50:
                            movies_data.append({'title': title, 'plot': plot_text, 'reviews': rev_text})
                            print(f" Saved ({len(movies_data)}): {title}")
                        
                        # Speed control (Adjust if you want to be faster/slower)
                        time.sleep(0.5) 
                        
                        # Stop if we hit 2000
                        if len(movies_data) >= 2000: break
                    except:
                        continue
        if len(movies_data) >= 2000: break
    if len(movies_data) >= 2000: break

df = pd.DataFrame(movies_data)
df.to_csv('vibe_movies_dataset_massive.csv', index=False)
print(f"\n MISSION ACCOMPLISHED! {len(df)} movies scraped.")