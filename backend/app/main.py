"""FastAPI application factory (V4 modular architecture)"""
import asyncio
import logging
from contextlib import asynccontextmanager

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from fastapi import FastAPI
from fastapi.middleware.gzip import GZipMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.cors import CORSMiddleware
from starlette.requests import Request

from .api.deps import get_rss_service, reset_rss_service
from .api.v1 import ALL_ROUTERS
from .core.config import (
    API_VERSION,
    APP_NAME,
    APP_VERSION,
    RSS_INGESTION_INTERVAL_MINUTES,
)
from .core.database import Database
from .core.logging_config import setup_logging

logger = setup_logging()


class UTF8ResponseMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        content_type = response.headers.get("content-type", "")
        if "application/json" in content_type and "charset" not in content_type:
            response.headers["content-type"] = "application/json; charset=utf-8"
        return response


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await Database.connect()
    await Database.create_indexes()
    rss = get_rss_service()
    await rss.migrate_country_data()

    scheduler = AsyncIOScheduler()
    scheduler.add_job(
        rss.run_ingestion,
        IntervalTrigger(minutes=RSS_INGESTION_INTERVAL_MINUTES),
        id="rss_ingestion",
        replace_existing=True,
    )
    scheduler.start()
    app.state.scheduler = scheduler

    logger.info("Running initial RSS ingestion...")
    asyncio.create_task(rss.run_ingestion())

    yield

    # Shutdown
    scheduler.shutdown()
    await rss.close()
    reset_rss_service()
    await Database.disconnect()


def create_app() -> FastAPI:
    app = FastAPI(
        title=f"{APP_NAME} API",
        description="Cybersecurity News Intelligence API (V4)",
        version=APP_VERSION,
        lifespan=lifespan,
    )

    # Middlewares
    app.add_middleware(UTF8ResponseMiddleware)
    app.add_middleware(GZipMiddleware, minimum_size=1000)
    app.add_middleware(
        CORSMiddleware,
        allow_credentials=True,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Health & root
    @app.get("/", tags=["Health"])
    async def root():
        return {"message": f"{APP_NAME} API is running", "version": APP_VERSION}

    @app.get("/health", tags=["Health"])
    async def health():
        return {"status": "ok", "version": APP_VERSION}

    # All routers
    for router in ALL_ROUTERS:
        app.include_router(router)

    logger.info(f"FastAPI app created: {APP_NAME} v{APP_VERSION} (api {API_VERSION})")
    return app


# Module-level app instance for ASGI servers (e.g. `uvicorn app.main:app`)
app = create_app()
