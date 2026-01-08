from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from app.models.comparison import (
    Comparison,
    ComparisonCreate,
    ComparisonRead,
    ComparisonWithAnalysis,
)
from app.services.model_service import ModelService
from app.services.comparison_service import ComparisonService
from app.database import get_session
from sqlmodel import Session, select


router = APIRouter(prefix="/api/comparisons", tags=["comparisons"])
model_service = ModelService()
comparison_service = ComparisonService()


@router.post("/", response_model=ComparisonWithAnalysis)
async def create_comparison(
    request: ComparisonCreate, session: Annotated[Session, Depends(get_session)]
):
    output_a, output_b = await model_service.compare_models(
        model_a=request.model_a,
        prompt_a=request.prompt_a,
        model_b=request.model_b,
        prompt_b=request.prompt_b,
    )

    similarity_score = comparison_service.compute_similarity(output_a, output_b)
    analysis = comparison_service.analyze_differences(output_a, output_b)

    comparison = Comparison(
        model_a=request.model_a,
        prompt_a=request.prompt_a,
        model_b=request.model_b,
        prompt_b=request.prompt_b,
        output_a=output_a,
        output_b=output_b,
        similarity_score=similarity_score,
    )

    session.add(comparison)
    session.commit()
    session.refresh(comparison)

    return ComparisonWithAnalysis(**comparison.model_dump(), analysis=analysis)


@router.get("/", response_model=list[ComparisonRead])
async def list_comparisons(
    session: Annotated[Session, Depends(get_session)],
    limit: int = 50,
):
    statement = select(Comparison).order_by(Comparison.created_at.desc()).limit(limit)

    comparisons = session.exec(statement).all()
    return comparisons


@router.get("/{comparison_id}", response_model=ComparisonRead)
async def get_comparison(
    comparison_id: int, session: Annotated[Session, Depends(get_session)]
):
    comparison = session.get(Comparison, comparison_id)
    if not comparison:
        raise HTTPException(status_code=404, detail="Comparison not found")
    return comparison
