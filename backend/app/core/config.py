# This file defines a single settings object for the app.
# BaseSettings lets values come from environment variables or a .env file.
# That way, later we can change the database URL or turn debug off without editing Python code.

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Fragrance Collection API"
    app_version: str = "0.1.0"
    debug: bool = True
    database_url: str = "postgresql://postgres:postgres@localhost:5432/fragrance_db"

    secret_key: str = "change_me_in_real_projects"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    anthropic_api_key: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )


# creating an instance of Settings class
# Settings is the blueprint (class)
# settings is the object created from it, we instantiate it "setting.app_name"
settings = Settings()
