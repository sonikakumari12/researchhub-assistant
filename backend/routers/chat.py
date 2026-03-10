from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.db_conection.database import get_db
from backend.model import Paper
from backend.schemas import ChatMessage
from backend.utils.embeddings import rank_papers_for_query
from backend.utils.groq_client import GroqConfig
from backend.utils.groq_wrapper import GroqWrapper


router = APIRouter(prefix="/chat", tags=["chat"])

config = GroqConfig.from_env()
groq = GroqWrapper(config)


@router.post("/")
async def chat(message: ChatMessage, db: Session = Depends(get_db)):

    papers = db.query(Paper).all()

    ranked = rank_papers_for_query(
        query=message.message,
        papers=papers,
        top_k=3,
    )

    if ranked:
        context_parts = []
        for paper, score in ranked:
            context_parts.append(
                f"Title: {paper.title}\nRelevance score: {score:.3f}\nContent:\n{paper.content}\n"
            )
        context = "\n\n---\n\n".join(context_parts)
    else:
        context = "No relevant papers were found in the current workspace."

    system_prompt = f"""
You are an AI research assistant helping users understand academic papers.

Research Paper Context:
{context}

Instructions:
1. First check if the answer exists in the provided paper context.
2. If the answer exists:
   - Respond using the paper information and clearly reference which paper(s) you used.
3. If not:
   - Start with: "This information is not present in the provided paper context."
   - Provide external knowledge with a source link.
"""

    prompt = f"""
{system_prompt}

User Question:
{message.message}
"""

    try:
        response = groq.generate_response(prompt)
        return {"response": response}

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"LLM service error: {str(e)}"
        )