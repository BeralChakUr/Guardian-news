"""Guardian News Backend - Main Entry Point for Render Deployment.

This file imports the FastAPI app from server.py for Render deployment.
Start command: uvicorn main:app --host 0.0.0.0 --port $PORT
"""
from server import app

# Health check endpoint (backup if not in server.py)
@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint for Render."""
    return {"status": "ok"}
