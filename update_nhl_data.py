import json
from datetime import datetime

def calculate_future_success_index(current, prospect, draft, age, cap):
    return round((current * 0.25 + prospect * 0.25 + draft * 0.20 + age * 0.15 + cap * 0.15), 1)

teams = [
    {
        "team": "Vancouver Canucks",
        "abbr": "VAN",
        "current": 78,
        "prospect": 74,
        "draft": 68,
        "age": 82,
        "cap": 76,
        "grit": 72,
        "futureIndex": calculate_future_success_index(78, 74, 68, 82, 76),
        "draftCapital": 68,
        "capHealth": 76,
        "prospects": [
            {"name": "Tom Willander", "pos": "D", "rating": 87, "tier": "Elite"},
            {"name": "Lekkerimäki", "pos": "RW", "rating": 84, "tier": "Top Line/Top Pair"}
        ]
    },
    {
        "team": "Edmonton Oilers",
        "abbr": "EDM",
        "current": 92,
        "prospect": 60,
        "draft": 55,
        "age": 84,
        "cap": 65,
        "grit": 68,
        "futureIndex": calculate_future_success_index(92, 60, 55, 84, 65),
        "draftCapital": 55,
        "capHealth": 65,
        "prospects": []
    },
    {
        "team": "Florida Panthers",
        "abbr": "FLA",
        "current": 95,
        "prospect": 65,
        "draft": 50,
        "age": 78,
        "cap": 70,
        "grit": 85,
        "futureIndex": calculate_future_success_index(95, 65, 50, 78, 70),
        "draftCapital": 50,
        "capHealth": 70,
        "prospects": []
    },
    {
        "team": "Dallas Stars",
        "abbr": "DAL",
        "current": 88,
        "prospect": 78,
        "draft": 72,
        "age": 75,
        "cap": 82,
        "grit": 78,
        "futureIndex": calculate_future_success_index(88, 78, 72, 75, 82),
        "draftCapital": 72,
        "capHealth": 82,
        "prospects": []
    },
    {
        "team": "Chicago Blackhawks",
        "abbr": "CHI",
        "current": 45,
        "prospect": 85,
        "draft": 90,
        "age": 68,
        "cap": 88,
        "grit": 55,
        "futureIndex": calculate_future_success_index(45, 85, 90, 68, 88),
        "draftCapital": 90,
        "capHealth": 88,
        "prospects": []
    }
]

data = {
    "lastUpdated": datetime.now().isoformat(),
    "teams": teams
}

with open("public/data/teams.json", "w") as f:
    json.dump(data, f, indent=2)

print("Data updated successfully!")
