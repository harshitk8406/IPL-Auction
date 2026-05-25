import socketio
import random
from asgiref.sync import sync_to_async

sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')

@sio.event
async def connect(sid, environ, auth):
    print('Client connected:', sid)

@sio.event
async def disconnect(sid):
    print('Client disconnected:', sid)

@sio.event
async def join_auction(sid, data):
    # data can contain teamId
    sio.enter_room(sid, 'auction_room')
    await sio.emit('message', {'text': f'A user joined the auction.'}, room='auction_room')

@sio.event
async def place_bid(sid, data):
    bid_amount = data.get('bid')
    team_id = data.get('teamId')
    # Later: validation against DB limits
    await sio.emit('new_bid', {'bid': bid_amount, 'teamId': team_id}, room='auction_room')

@sio.event
async def play_ball(sid, data):
    user_choice = int(data.get('choice'))
    match_id = data.get('matchId')
    # Bowling AI picks 1,2,3,4,6
    bot_choice = random.choice([1, 2, 3, 4, 6])
    
    if user_choice == bot_choice:
        outcome = 'wicket'
        runs = 0
    else:
        outcome = 'run'
        runs = user_choice
        
    await sio.emit('ball_result', {
        'outcome': outcome,
        'runs': runs,
        'userChoice': user_choice,
        'botChoice': bot_choice
    }, room=sid)
