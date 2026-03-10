from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from io import BytesIO
from sqlalchemy.orm import Session
from backend.utils.ai_summary import generate_summary
from backend.db_conection.database import get_db
from backend.model import Paper
from backend.schemas import (
    PaperCreate,
    PaperImportById,
    PaperSearchResponse,
    PaperSource,
)
from backend.utils.academic_search import (
    fetch_paper_by_id,
    search_papers,
)
from backend.utils.embeddings import generate_embedding
from pypdf import PdfReader


router = APIRouter(prefix="/papers", tags=["papers"])


@router.post("/import")
def import_paper(paper: PaperCreate, db: Session = Depends(get_db)):

    embedding = generate_embedding(paper.content)

    new_paper = Paper(
        title=paper.title,
        content=paper.content,
        owner_id=1,
        embedding=embedding or None,
    )

    db.add(new_paper)
    db.commit()

    return {"message": "Paper imported successfully"}


@router.get("/", response_model=list[PaperCreate])
def get_papers(db: Session = Depends(get_db)):

    papers = db.query(Paper).all()

    return papers


@router.get("/search", response_model=PaperSearchResponse)
async def search_external_papers(
    source: PaperSource,
    q: str,
    max_results: int = 10,
):

    results = await search_papers(source=source, query=q, max_results=max_results)
    
    # Generate AI summary for each paper
    for paper in results:
        if paper.abstract:
            summary = await generate_summary(paper.abstract)
            paper.summary = summary

    return PaperSearchResponse(results=results)




@router.post("/import/one-click")
async def one_click_import(
    payload: PaperImportById,
    db: Session = Depends(get_db),
):

    metadata = await fetch_paper_by_id(
        source=payload.source,
        external_id=payload.external_id,
    )

    if metadata is None:
        raise HTTPException(status_code=404, detail="Paper not found in external source")

    abstract_text = metadata.abstract or ""
    embedding = generate_embedding(abstract_text)

    new_paper = Paper(
        title=metadata.title,
        content=abstract_text,
        owner_id=1,
        embedding=embedding or None,
    )

    db.add(new_paper)
    db.commit()
    db.refresh(new_paper)

    return new_paper


@router.post("/upload")
async def upload_pdf(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    data = await file.read()
    text = ""

    try:
        reader = PdfReader(BytesIO(data))
        for page in reader.pages:
            text += page.extract_text() or ""
    except Exception:
        text = ""

    title = file.filename or "Uploaded PDF"
    content = text.strip() or f"PDF uploaded: {title}"
    embedding = generate_embedding(content) if content else []

    new_paper = Paper(
        title=title,
        content=content,
        owner_id=1,
        embedding=embedding or None,
    )

    db.add(new_paper)
    db.commit()
    db.refresh(new_paper)

    return {
        "id": new_paper.id,
        "title": new_paper.title,
        "content": new_paper.content,
    }
