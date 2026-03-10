from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.db_conection.database import Base, engine
from backend.routers import auth, papers, chat, workspace, documents
from backend.routers import ai_router 



Base.metadata.create_all(bind=engine)

app = FastAPI(title="ResearchHub AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)

app.include_router(papers.router)

app.include_router(chat.router)

app.include_router(workspace.router)

app.include_router(ai_router.router)

app.include_router(documents.router)
