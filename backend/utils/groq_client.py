import os 
from dataclasses import dataclass
from dotenv import load_dotenv


load_dotenv()

@dataclass(frozen=True) # Make config immutable to prevent runtime modification
class GroqConfig:
    api_key: str
    model: str = "llama-3.3-70b-versatile"
    temperature: float = 0.3
    max_tokens: int = 2000
    top_p: float = 0.9
    
    @classmethod
    def from_env(cls) -> "GroqConfig":
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY is not set in environment variables.")
        
        return cls(api_key=api_key)
