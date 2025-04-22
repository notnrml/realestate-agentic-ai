from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from dotenv import load_dotenv

 # SQLite + Pydantic schema for data, we can use SQLAlchemy here too if we want to make things easier

Base = declarative_base()
        
sqlite_engine = create_engine('sqlite:///estate.db')

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=sqlite_engine)

def init_sqlite_db():
    try:
        Base.metadata.create_all(bind=sqlite_engine)
    except Exception as e:
        print(f"Error creating SQLite tables: {e}")

def get_sqlite_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
