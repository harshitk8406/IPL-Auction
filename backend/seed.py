import os
import django
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ipl_sim.settings')
django.setup()

from core.models import Team, Player

def run_seed():
    teams_data = ['CSK', 'MI', 'RCB', 'KKR', 'RR', 'DC', 'PBKS', 'SRH', 'LSG', 'GT']
    for t_name in teams_data:
        Team.objects.get_or_create(name=t_name, defaults={'purse': 90000}) # Storing in Lakhs for simplicity (90000 L = 90 Cr)
    
    print("Teams Seeded.")

    players_data = [
        ("MS Dhoni", "Wicketkeeper", "Indian"),
        ("Virat Kohli", "Batsman", "Indian"),
        ("Rohit Sharma", "Batsman", "Indian"),
        ("Jasprit Bumrah", "Bowler", "Indian"),
        ("Hardik Pandya", "All-Rounder", "Indian"),
        ("KL Rahul", "Wicketkeeper", "Indian"),
        ("Ravindra Jadeja", "All-Rounder", "Indian"),
        ("Suryakumar Yadav", "Batsman", "Indian"),
        ("Rishabh Pant", "Wicketkeeper", "Indian"),
        ("Shubman Gill", "Batsman", "Indian"),
        ("Mohammed Siraj", "Bowler", "Indian"),
        ("Shami", "Bowler", "Indian"),
        ("Glenn Maxwell", "All-Rounder", "Overseas"),
        ("Jos Buttler", "Wicketkeeper", "Overseas"),
        ("Rashid Khan", "Bowler", "Overseas"),
        ("Trent Boult", "Bowler", "Overseas"),
        ("David Warner", "Batsman", "Overseas"),
        ("Kagiso Rabada", "Bowler", "Overseas"),
        ("Ben Stokes", "All-Rounder", "Overseas"),
        ("Mitchell Starc", "Bowler", "Overseas"),
        ("Pat Cummins", "Bowler", "Overseas"),
        ("Sunil Narine", "All-Rounder", "Overseas"),
        ("Andre Russell", "All-Rounder", "Overseas"),
        ("Moeen Ali", "All-Rounder", "Overseas")
    ]

    for p in players_data:
        Player.objects.get_or_create(
            name=p[0],
            defaults={
                'role': p[1],
                'nationality': p[2],
                'basePrice': random.choice([50, 100, 150, 200]) # 50L to 2Cr
            }
        )
    print("Players Seeded.")

if __name__ == '__main__':
    run_seed()
