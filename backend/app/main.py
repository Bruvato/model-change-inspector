from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.routers import comparisons
from app.database import create_db_and_tables


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("start")
    create_db_and_tables()

    yield
    print("shutdown")


app = FastAPI(lifespan=lifespan)

app.include_router(comparisons.router)


@app.get("/")
async def root():
    return {"message": "Hello World"}
