# Smart Roommate Finder - Backend

This is the FastAPI backend for the Smart Roommate Finder application.

## Setup Instructions

### Prerequisites
- Python 3.9+
- PostgreSQL 12+
- pip (Python package manager)

### Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
pip install fastapi uvicorn sqlalchemy psycopg2-binary python-multipart
```

3. Configure your database connection in `db/database.py`:
```python
URL_DATABASE = "postgresql://postgres:your_password@localhost:5432/smart_roommate"
```

### Running the Server

Start the development server:
```bash
uvicorn main:app --reload
```

The API will be available at: `http://localhost:8000`

API Documentation (interactive): `http://localhost:8000/docs`

---

## Backend Project Structure

The backend is now organized into separate layers for routes, services, schemas, models, and database configuration:

- `main.py` — FastAPI entrypoint and CORS setup
- `db/database.py` — SQLAlchemy engine and session setup
- `model/user.py` — SQLAlchemy `User` model
- `schemas/user.py` — Pydantic request/response models
- `services/security.py` — password hashing and verification helpers
- `services/user_service.py` — user database operations and business logic
- `routes/user.py` — HTTP routes that call service functions

## Database Schema Management

### Syncing Database After Schema Changes

When you make changes to the SQLAlchemy models (in `model/user.py`), you need to sync those changes with your PostgreSQL database.

#### Option 1: Automatic Schema Sync (Recommended for Development)

If your table already exists and you just need to add a new column:

```bash
cd backend
python3 << 'EOF'
from sqlalchemy import text, inspect
from db.database import engine

try:
    # Get current columns from database
    inspector = inspect(engine)
    existing_columns = {col['name'] for col in inspector.get_columns('users')}
    
    # Define expected columns from model
    expected_columns = {
        'id', 'username', 'email', 'hashed_password', 'phone_number',
        'age', 'diet', 'allergies', 'description', 'street_address',
        'city', 'zip_code', 'state', 'country', 'occupation', 'is_active'
    }
    
    # Find missing columns
    missing_columns = expected_columns - existing_columns
    
    if missing_columns:
        print(f"Found missing columns: {missing_columns}")
        with engine.connect() as connection:
            for column in missing_columns:
                if column == 'phone_number':
                    connection.execute(text("ALTER TABLE users ADD COLUMN phone_number VARCHAR"))
                elif column == 'is_active':
                    connection.execute(text("ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE"))
                # Add more mappings as needed
            connection.commit()
        print("✓ Database schema synced successfully!")
    else:
        print("✓ Database schema is already up to date")

except Exception as e:
    print(f"Error: {e}")
EOF
```

#### Option 2: Full Table Recreate (For Development Only)

⚠️ **WARNING: This will DELETE all data in the users table!**

If you have major schema changes and you're in development:

```bash
cd backend
python3 << 'EOF'
from db.database import engine, Base
from model.user import User

# Drop all tables and recreate
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

print("✓ All tables recreated successfully!")
EOF
```

#### Option 3: Using Alembic (For Production)

For production environments, use Alembic for proper database migrations:

```bash
# Initialize Alembic (one time)
alembic init alembic

# Create a migration after model changes
alembic revision --autogenerate -m "Add phone_number column"

# Apply the migration
alembic upgrade head
```

---

## API Endpoints

### User Registration
- **POST** `/users/`
- **Request Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone_number": "+1 (555) 123-4567"
  }
  ```
- **Response:**
  ```json
  {
    "message": "User registered successfully",
    "user_id": 1,
    "email": "john@example.com"
  }
  ```

### Get User by ID
- **GET** `/user/{user_id}`
- **Response:**
  ```json
  {
    "id": 1,
    "username": "John Doe",
    "email": "john@example.com",
    ...
  }
  ```

---

## Project Structure

```
backend/
├── main.py                 # FastAPI app entry point
├── db/
│   └── database.py        # Database configuration
├── model/
│   └── user.py            # SQLAlchemy User model
├── routes/
│   └── user.py            # User API endpoints
└── README.md              # This file
```

---

## CORS Configuration

CORS is configured in `main.py` to allow requests from:
- http://localhost:3000
- http://localhost:3001
- http://127.0.0.1:3000
- http://127.0.0.1:3001
- http://10.0.0.132:3000

To add more origins, update the `allow_origins` list in `main.py`.

---

## Troubleshooting

### Database Connection Error
- Ensure PostgreSQL is running
- Check your connection string in `db/database.py`
- Verify database name, user, and password

### Schema Mismatch Errors
- Run the "Automatic Schema Sync" script above
- Check that your model changes are saved before running the sync script

### CORS Errors
- Ensure the frontend URL is in the `allow_origins` list in `main.py`
- Clear your browser cache and restart the dev server

---

## Security Notes

⚠️ **Before deploying to production:**

1. **Hash Passwords**: Use `bcrypt` or `passlib` to hash passwords
2. **Environment Variables**: Move database credentials to `.env` file
3. **Validation**: Add request validation with Pydantic models
4. **Authentication**: Implement JWT tokens for secure API access
5. **Rate Limiting**: Add rate limiting to prevent abuse

---

## Contributing

When making changes to the database schema:
1. Update the model in `model/user.py`
2. Run the database sync script
3. Test your changes locally
4. Document the changes in this README
