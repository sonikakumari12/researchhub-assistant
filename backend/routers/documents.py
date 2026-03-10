from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.db_conection.database import get_db
from backend.model import Document
from backend.schemas import DocumentCreate, DocumentOut, DocumentUpdate

router = APIRouter(prefix="/documents", tags=["documents"])


@router.get("/", response_model=list[DocumentOut])
def list_documents(
    workspace_id: int | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(Document)
    if workspace_id is not None:
        query = query.filter(Document.workspace_id == workspace_id)
    return query.all()


@router.post("/", response_model=DocumentOut)
def create_document(payload: DocumentCreate, db: Session = Depends(get_db)):
    if not payload.title.strip():
        raise HTTPException(status_code=400, detail="Document title is required")

    document = Document(
        title=payload.title.strip(),
        content=payload.content,
        workspace_id=payload.workspace_id,
    )
    db.add(document)
    db.commit()
    db.refresh(document)
    return document


@router.put("/{document_id}", response_model=DocumentOut)
def update_document(
    document_id: int,
    payload: DocumentUpdate,
    db: Session = Depends(get_db),
):
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    if payload.title is not None:
        document.title = payload.title
    if payload.content is not None:
        document.content = payload.content
    if payload.workspace_id is not None:
        document.workspace_id = payload.workspace_id

    db.commit()
    db.refresh(document)
    return document
