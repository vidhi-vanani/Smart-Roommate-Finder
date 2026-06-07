"""
Development helpers for syncing database schema changes.
"""
from sqlalchemy import inspect, text

from db.database import engine


USER_PREFERENCE_COLUMNS = {
    "min_budget": "INTEGER",
    "max_budget": "INTEGER",
    "quiet_hours_from": "INTEGER",
    "quiet_hours_to": "INTEGER",
    "cleanliness": "VARCHAR",
    "social_interaction": "VARCHAR",
    "interests": "VARCHAR",
    "smoking_preference": "BOOLEAN",
    "profile_photo": "VARCHAR",
    "gender": "VARCHAR",
}

MESSAGE_COLUMNS = {
    "is_read": "BOOLEAN DEFAULT FALSE NOT NULL",
}


def sync_user_preference_columns():
    """
    Add missing preference columns to the existing users table.

    SQLAlchemy create_all creates missing tables, but it does not alter an
    already-created table. This keeps local development databases up to date.
    """
    inspector = inspect(engine)
    existing_columns = {column["name"] for column in inspector.get_columns("users")}
    missing_columns = {
        column_name: column_type
        for column_name, column_type in USER_PREFERENCE_COLUMNS.items()
        if column_name not in existing_columns
    }

    if not missing_columns:
        return

    with engine.begin() as connection:
        for column_name, column_type in missing_columns.items():
            connection.execute(
                text(f"ALTER TABLE users ADD COLUMN {column_name} {column_type}")
            )


def sync_message_columns():
    inspector = inspect(engine)
    if "messages" not in inspector.get_table_names():
        return

    existing_columns = {column["name"] for column in inspector.get_columns("messages")}
    missing_columns = {
        column_name: column_type
        for column_name, column_type in MESSAGE_COLUMNS.items()
        if column_name not in existing_columns
    }

    if not missing_columns:
        return

    with engine.begin() as connection:
        for column_name, column_type in missing_columns.items():
            connection.execute(
                text(f"ALTER TABLE messages ADD COLUMN {column_name} {column_type}")
            )
