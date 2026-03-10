from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.db_conection.database import get_db
from backend.model import Workspace
from backend.schemas import WorkspaceCreate, WorkspaceOut

router = APIRouter()

@router.get("/workspaces", response_model=list[WorkspaceOut])
def get_workspaces(db: Session = Depends(get_db)):
    workspaces = db.query(Workspace).all()
    return workspaces


@router.get("/workspaces/{workspace_id}", response_model=WorkspaceOut)
def get_workspace(workspace_id: int, db: Session = Depends(get_db)):
    workspace = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    return workspace


@router.post("/workspaces", response_model=WorkspaceOut)
def create_workspace(payload: WorkspaceCreate, db: Session = Depends(get_db)):
    if not payload.name.strip():
        raise HTTPException(status_code=400, detail="Workspace name is required")

    workspace = Workspace(
        name=payload.name.strip(),
        description=payload.description,
        user_id=1,
    )
    db.add(workspace)
    db.commit()
    db.refresh(workspace)
    return workspace
