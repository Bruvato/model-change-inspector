from pydantic import ConfigDict
from sqlmodel import SQLModel, Field
from datetime import datetime, timezone
from typing import Optional


class ComparisonBase(SQLModel):
    model_a: str
    prompt_a: str
    model_b: str
    prompt_b: str


class Comparison(ComparisonBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    output_a: str
    output_b: str
    similarity_score: Optional[float] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ComparisonCreate(ComparisonBase):
    pass


class ComparisonRead(ComparisonBase):
    id: int
    output_a: str
    output_b: str
    similarity_score: Optional[float]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ComparisonWithAnalysis(ComparisonRead):
    analysis: dict