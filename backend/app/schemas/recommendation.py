from pydantic import BaseModel, Field


class RecommendationRequest(BaseModel):
    season: str = Field(pattern="^(spring|summer|fall|winter)$")
    occasion: str = Field(pattern="^(casual|office|date|wedding|formal|party)$")
    time_of_day: str = Field(pattern="^(early_morning|day|evening|night)$")
    weather: str = Field(pattern="^(hot|mild|cold|rainy)$")
    location_type: str = Field(pattern="^(indoor|outdoor)$")

    model_config = {"extra": "forbid"}


class RecommendationFragranceResponse(BaseModel):
    id: int
    name: str
    brand: str


class RecommendationResponse(BaseModel):
    fragrances: list[RecommendationFragranceResponse]
