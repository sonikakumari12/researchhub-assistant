from fastapi import APIRouter
from pydantic import BaseModel
from backend.utils.ai_summary import generate_summary  # your function

router = APIRouter()

class SummaryRequest(BaseModel):
    text: str

@router.post("/summary")
async def get_summary(payload: SummaryRequest):
    summary = await generate_summary(payload.text)
    return {"summary": summary}
