# Entry point of the API. It creates the FastAPI application object and defines the first route so the server can run

from fastapi import FastAPI


# Creating application object
app = FastAPI(
    title="Fragrance Collection API",
    description="Backend service for managing fragrance collections and giving contextual recommendations",
    version="0.1.0",
)


# Basic route so we can confirm the server is working
@app.get("/")
def health_check():
    return {"status": "API running"}
