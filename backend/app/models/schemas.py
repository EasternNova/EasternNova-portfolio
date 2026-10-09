from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)
    session_id: str | None = Field(default=None, max_length=100)


class ChatResponse(BaseModel):
    message: str
    session_id: str
    intent: str = "general"
    source: str = "enova"


class ErrorResponse(BaseModel):
    error: str
    code: str