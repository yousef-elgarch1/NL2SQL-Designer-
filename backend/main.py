"""
NL2SQL Generator - Main FastAPI Application
Entry point for the backend server
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import prompt_router, diagram_router, sql_router, optimization_router, sample_data_router, database_router
from services.llm_service import LLMService

app = FastAPI(
    title="NL2SQL Generator API",
    description="AI-Powered Database Schema Designer with Natural Language Processing",
    version="1.0.0"
)

# CORS Configuration - Allow all localhost ports
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins in development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "online",
        "message": "NL2SQL Generator API is running",
        "version": "1.0.0"
    }


@app.get("/health")
async def health():
    """Detailed health check"""
    # Check LLM service
    try:
        llm_service = LLMService()
        llm_status = "online" if await llm_service.check_health() else "offline"
    except:
        llm_status = "offline"

    return {
        "status": "healthy" if llm_status == "online" else "degraded",
        "services": {
            "api": "online",
            "llm": llm_status,
            "database": "not_configured"  # Phase 3
        }
    }


# Include routers - Phase 1 & 2
app.include_router(prompt_router.router, prefix="/api/v1/prompt", tags=["Prompt"])
app.include_router(diagram_router.router, prefix="/api/v1/diagram", tags=["Diagram"])
app.include_router(sql_router.router, prefix="/api/v1/sql", tags=["SQL"])
app.include_router(optimization_router.router, prefix="/api/v1/optimization", tags=["Optimization"])
app.include_router(sample_data_router.router, prefix="/api/v1/sample-data", tags=["Sample Data"])
app.include_router(database_router.router, prefix="/api/v1/database", tags=["Database"])
# app.include_router(export_router.router, prefix="/api/v1/export", tags=["Export"])  # Phase 4


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
