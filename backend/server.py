"""Guardian News Backend V4 - Thin entry point.

The actual application lives under the modular ``app/`` package.
This file is kept for backward compatibility with existing imports
(e.g. ``main.py`` and uvicorn ``server:app`` commands).
"""
from app.main import create_app

app = create_app()
