from django.db import models
from django.contrib.auth.models import User

class Team(models.Model):
    name = models.CharField(max_length=100, unique=True)
    purse = models.IntegerField(default=900000000) # Default 90 Crores
    humanControlled = models.BooleanField(default=False)
    user = models.OneToOneField(User, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return self.name

class Player(models.Model):
    name = models.CharField(max_length=100)
    role = models.CharField(max_length=50) # Batsman, Bowler, All-Rounder
    basePrice = models.IntegerField()
    nationality = models.CharField(max_length=50) # Indian, Overseas
    team = models.ForeignKey(Team, related_name='squad', on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return self.name

class Auction(models.Model):
    status = models.CharField(max_length=20, default='pending') # pending, active, completed
    currentNomination = models.ForeignKey(Player, on_delete=models.SET_NULL, null=True, blank=True)
    currentBid = models.IntegerField(default=0)
    highestBidder = models.ForeignKey(Team, on_delete=models.SET_NULL, null=True, blank=True)

class Match(models.Model):
    teamA = models.ForeignKey(Team, related_name='matches_as_teamA', on_delete=models.CASCADE)
    teamB = models.ForeignKey(Team, related_name='matches_as_teamB', on_delete=models.CASCADE)
    winner = models.ForeignKey(Team, related_name='matches_won', on_delete=models.SET_NULL, null=True, blank=True)
    scorecard = models.JSONField(default=dict)
    date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, default='scheduled')

class Fixture(models.Model):
    matchId = models.OneToOneField(Match, on_delete=models.CASCADE)
    round = models.IntegerField()
    homeTeam = models.ForeignKey(Team, related_name='home_fixtures', on_delete=models.CASCADE)
    awayTeam = models.ForeignKey(Team, related_name='away_fixtures', on_delete=models.CASCADE)
    status = models.CharField(max_length=20, default='scheduled')
