from pydantic import BaseModel, ConfigDict, EmailStr
from enum import Enum
from typing import List, Optional


class UserCreate(BaseModel):

    email: EmailStr

    password: str


class UserLogin(BaseModel):

    email: EmailStr

    password: str


class PaperCreate(BaseModel):

    title: str

    content: str


class PaperSource(str, Enum):
    arxiv = "arxiv"
    pubmed = "pubmed"
class PaperSearchResult(BaseModel):
    source: str
    external_id: str
    title: str
    abstract: Optional[str]
    authors: list[str]
    published_at: str | None = None
    summary: str | None = None

class PaperSearchResponse(BaseModel):
    results: List[PaperSearchResult]


class PaperImportById(BaseModel):
    source: PaperSource
    external_id: str


class PaperMetadata(BaseModel):
    source: PaperSource
    external_id: str
    title: str
    abstract: Optional[str] = None


class ChatMessage(BaseModel):

    message: str


class WorkspaceCreate(BaseModel):
    name: str
    description: Optional[str] = None


class WorkspaceOut(WorkspaceCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)


class DocumentBase(BaseModel):
    title: str
    content: str
    workspace_id: Optional[int] = None


class DocumentCreate(DocumentBase):
    pass


class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    workspace_id: Optional[int] = None


class DocumentOut(DocumentBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
