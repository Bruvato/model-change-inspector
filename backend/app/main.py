from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import comparisons
from app.database import create_db_and_tables


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("start")
    create_db_and_tables()

    yield
    print("shutdown")


app = FastAPI(lifespan=lifespan)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(comparisons.router)


@app.get("/")
async def root():
    return {"message": "Hello World"}
