from uuid import uuid4

from fastapi import APIRouter, HTTPException

from app.models.schemas import ChatRequest, ChatResponse

router = APIRouter(prefix="/api", tags=["Chat"])


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    message = request.message.strip()

    if not message:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "Message cannot be empty.",
                "code": "MESSAGE_REQUIRED"
            }
        )

    session_id = request.session_id or str(uuid4())

    return ChatResponse(
        message="ENOVA backend is online. AI intelligence will be connected in ENOVA-3.",
        session_id=session_id,
        intent="general",
        source="enova"
    )