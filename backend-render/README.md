# Guardian News Backend

A production-ready FastAPI backend for the Guardian News cybersecurity intelligence platform.

## Features

- 📰 **News API** - Fetch, filter, and search cybersecurity news
- 📊 **Dashboard Metrics** - Real-time threat level and statistics
- 🎯 **Threat Radar** - Category-based threat distribution
- 📅 **Timeline** - Chronological threat events
- 🤖 **AI Summarization** - OpenAI-powered article analysis
- 🌱 **Seed Data** - Pre-populated sample data for testing

## Tech Stack

- **FastAPI** - Modern Python web framework
- **MongoDB Atlas** - Cloud database
- **Motor** - Async MongoDB driver
- **Pydantic** - Data validation
- **Uvicorn** - ASGI server

## Quick Start

### 1. Clone and Setup

```bash
cd backend-render
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your MongoDB Atlas connection string
```

### 3. Run Locally

```bash
uvicorn app.main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

## Deploy to Render

### Option 1: Using render.yaml (Recommended)

1. Push this code to a Git repository (GitHub, GitLab)
2. Connect your repo to Render
3. Render will auto-detect `render.yaml`
4. Set environment variables in Render dashboard:
   - `MONGO_URL` - Your MongoDB Atlas connection string
   - `FRONTEND_URL` - Your Vercel frontend URL
   - `OPENAI_API_KEY` (optional) - For AI summaries

### Option 2: Manual Setup

1. Create a new **Web Service** on Render
2. Connect your repository
3. Configure:
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables

## MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free cluster
3. Create a database user
4. Whitelist IP addresses (use `0.0.0.0/0` for Render)
5. Get your connection string
6. Replace `<password>` with your database user password

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/news` | List news (paginated, filterable) |
| GET | `/api/news/{id}` | Get single article |
| GET | `/api/dashboard/metrics` | Dashboard stats |
| GET | `/api/dashboard/radar` | Threat radar data |
| GET | `/api/dashboard/timeline` | Threat timeline |
| POST | `/api/ai/summarize` | AI summarization |

### Query Parameters for `/api/news`

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `source` - Filter by source name
- `severity` - Filter: critical, high, medium, low
- `type` - Filter by threat type
- `search` - Search in title and summary

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URL` | Yes | MongoDB connection string |
| `DB_NAME` | No | Database name (default: guardian_news) |
| `FRONTEND_URL` | Yes | Frontend URL for CORS |
| `OPENAI_API_KEY` | No | OpenAI API key for AI features |
| `DEBUG` | No | Enable debug mode |

## Project Structure

```
backend-render/
├── app/
│   ├── __init__.py
│   ├── main.py          # FastAPI application
│   ├── config.py        # Configuration
│   ├── database.py      # MongoDB connection
│   ├── models/          # Pydantic models
│   ├── routes/          # API endpoints
│   └── services/        # Business logic
├── requirements.txt
├── render.yaml          # Render deployment config
├── .env.example
└── README.md
```

## License

MIT
