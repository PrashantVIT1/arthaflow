import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Load environment variables BEFORE importing database config
load_dotenv()

from app.api.analytics import router as analytics_router  # noqa: E402
from app.api.customers import router as customers_router  # noqa: E402
from app.api.etl import router as etl_router  # noqa: E402
from app.api.orders import router as orders_router  # noqa: E402
from app.api.pipeline import router as pipeline_router  # noqa: E402
from app.database.config import Base, get_engine  # noqa: E402

app = FastAPI(
    title="ArthaFlow API",
    description="Enterprise ETL & Business Analytics Platform API",
    version="1.0.0",
)

# CORS Configuration - Read from environment variable or use default
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5174")

origins = (
    frontend_url.split(",") if frontend_url else ["http://localhost:5174"]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(analytics_router)
app.include_router(pipeline_router)
app.include_router(etl_router)
app.include_router(customers_router)
app.include_router(orders_router)


@app.on_event("startup")
def startup_event():
    """Create database tables on startup."""
    try:
        engine = get_engine()
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"Warning: Could not connect to database: {e}")
        print("App will run without database connection")


@app.get("/")
def root():
    """Root endpoint."""
    return {"message": "ArthaFlow API is running"}
