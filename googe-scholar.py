import pandas as pd
from scholarly import scholarly
import tqdm

# Example: workshop authors
workshops = {
    "The 4th DataCV Workshop and Challenge": [
        "Fatemeh Saleh", "Liang Zheng", "Qiang Qiu", "José Lezama",
        "Xin Zhao", "Qiuhong Ke", "Manmohan Chandraker", "Xiaoxiao Sun",
        "Yue Yao", "Kevin W. Bowyer", "Haiyu Wu"
    ],
    "Affective & Behavior Analysis in-the-wild": [
        "Dimitrios Kollias", "Stefanos Zafeiriou", "Irene Kotsia", "Greg Slabaugh"
    ]
}

results = []

for workshop, authors in workshops.items():
    for author in authors:
        print(author)
        try:
            # Search for author
            search_query = scholarly.search_author(author)
            author_data = next(search_query)  # first match
            
            # Fill in info
            name = author_data.get("name", author)
            affiliation = author_data.get("affiliation", "N/A")
            citedby = author_data.get("citedby", "N/A")
            
            results.append([workshop, name, citedby, affiliation])
        except Exception as e:
            results.append([workshop, author, "Not found", "Not found"])
            print(f"Error for {author}: {e}")

# Save to Excel
df = pd.DataFrame(results, columns=["Workshop", "Author", "Citations", "Affiliation"])
# df.to_excel("workshop_authors.xlsx", index=False)

print(df)

print("✅ Done. Data saved to workshop_authors.xlsx")
