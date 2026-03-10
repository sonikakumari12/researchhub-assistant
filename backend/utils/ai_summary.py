import httpx
import os
from dotenv import load_dotenv


load_dotenv()
GROQ_API_KEY =os.getenv("GROQ_API_KEY")

async def generate_summary(abstract: str):

    prompt = f"""
    
    You are an expert research assistant.

    Summarize the following research paper abstract in ONE concise sentence
    so that a reader can quickly understand what the paper is about.

    Avoid technical jargon where possible.

    Abstract:
    {abstract}
    """

    

    async with httpx.AsyncClient() as client:
        res = await client.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "llama-3.3-70b-versatile",
                "messages": [{"role": "user", "content": prompt}],
            },
        )

    data = res.json()

    return data["choices"][0]["message"]["content"]