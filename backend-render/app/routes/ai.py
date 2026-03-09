"""AI API routes."""
from fastapi import APIRouter
from ..models import AISummarizeRequest, AISummarizeResponse
from ..services import summarize_article

router = APIRouter(prefix="/api/ai", tags=["AI"])


@router.post("/summarize", response_model=AISummarizeResponse)
async def summarize_text(request: AISummarizeRequest):
    """Generate AI summary for article text."""
    return await summarize_article(
        text=request.text,
        title=request.title
    )
