from rest_framework import serializers
from .models import Team, Player, Auction, Match, Fixture
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email')

class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = '__all__'

class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = '__all__'

class MatchSerializer(serializers.ModelSerializer):
    teamA_name = serializers.CharField(source='teamA.name', read_only=True)
    teamB_name = serializers.CharField(source='teamB.name', read_only=True)

    class Meta:
        model = Match
        fields = '__all__'

class AuctionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Auction
        fields = '__all__'
