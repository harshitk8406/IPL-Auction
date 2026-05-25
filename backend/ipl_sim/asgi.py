"""
ASGI config for ipl_sim project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/6.0/howto/deployment/asgi/
"""

import os
from django.core.asgi import get_asgi_application
from core.socket_app import sio
import socketio

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ipl_sim.settings')

django_asgi_app = get_asgi_application()
application = socketio.ASGIApp(sio, django_asgi_app)
