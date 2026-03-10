from sqlalchemy import Column, Integer, String, ForeignKey, Float
from sqlalchemy.dialects.postgresql import ARRAY

from backend.db_conection.database import Base


class User(Base):

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    email = Column(String, unique=True)

    password_hash = Column(String)


class Paper(Base):

    __tablename__ = "papers"

    id = Column(Integer, primary_key=True)

    title = Column(String)

    content = Column(String)

    owner_id = Column(Integer, ForeignKey("users.id"))

    embedding = Column(ARRAY(Float), nullable=True)

class Workspace(Base):
    __tablename__ = "workspaces"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String)

    description = Column(String)
    
    user_id = Column(Integer, ForeignKey("users.id"))


class Document(Base):

    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String)

    content = Column(String)

    workspace_id = Column(Integer, ForeignKey("workspaces.id"), nullable=True)
