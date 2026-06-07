# Smart Roommate Finder - Backend

This is the FastAPI backend for the Smart Roommate Finder application. It manages user accounts, login, roommate profile preferences, profile photos, roommate requests, accepted connections, messages, unread message notifications, and generated development data.

The backend uses PostgreSQL with SQLAlchemy and exposes REST APIs used by the Next.js frontend.

---

## Tech Stack

- **Python**
- **FastAPI**
- **Uvicorn**
- **SQLAlchemy**
- **Pydantic**
- **PostgreSQL**
- **Passlib / bcrypt**
- **python-multipart**

---

## Backend Project Structure

```text
backend/
├── db/
│   ├── database.py
│   └── schema_sync.py
├── model/
│   ├── matches.py
│   ├── message.py
│   ├── request.py
│   └── user.py
├── routes/
│   ├── message.py
│   └── user.py
├── schemas/
│   ├── __init__.py
│   ├── message.py
│   └── user.py
├── scripts/
│   └── seed_generated_users.py
├── services/
│   ├── __init__.py
│   ├── message_notification_service.py
│   ├── message_service.py
│   ├── security.py
│   └── user_service.py
├── static/
│   └── uploads/
├── main.py
├── seed_users.sql
├── seed_users_credentials.txt
└── README.md
```

---

## Important Files

- **`main.py`** - FastAPI application entry point, CORS configuration, static file mounting, database table creation, schema sync, and router registration.
- **`db/database.py`** - SQLAlchemy database engine, session factory, and declarative base.
- **`db/schema_sync.py`** - Development helpers for syncing user preference and message columns.
- **`model/user.py`** - SQLAlchemy model for users, profiles, and roommate preferences.
- **`model/request.py`** - SQLAlchemy model for roommate requests.
- **`model/message.py`** - SQLAlchemy model for chat messages.
- **`model/matches.py`** - SQLAlchemy model for generated roommate matches.
- **`routes/user.py`** - User registration, login, profile, photo upload, and roommate request routes.
- **`routes/message.py`** - Message conversation, send message, unread count, and mark-read routes.
- **`schemas/user.py`** - Pydantic request and response schemas for users and roommate requests.
- **`schemas/message.py`** - Pydantic request and response schemas for messages and unread counts.
- **`services/security.py`** - Password hashing and password verification helpers.
- **`services/user_service.py`** - User and roommate request database logic.
- **`services/message_service.py`** - Message creation and conversation retrieval logic.
- **`services/message_notification_service.py`** - Unread message count and mark-read logic.
- **`scripts/seed_generated_users.py`** - Script for loading generated sample users, matches, requests, and photos.

---

## Setup

### 1. Install Dependencies

From the `backend` directory:

```bash
pip install fastapi uvicorn sqlalchemy psycopg2-binary python-jose "passlib[bcrypt]" python-multipart
```

### 2. Configure PostgreSQL

The database connection is configured in:

```text
db/database.py
```

Current local database URL:

```text
postgresql://postgres:1234@localhost:5433/smart_roommate
```

Create the database before running the backend:

```sql
CREATE DATABASE smart_roommate;
```

If your local PostgreSQL credentials or port are different, update `URL_DATABASE` in `db/database.py`.

### 3. Run the Backend

From the `backend` directory:

```bash
uvicorn main:app --reload
```

Backend server:

```text
http://localhost:8000
```

FastAPI docs:

```text
http://localhost:8000/docs
```

---

## Startup Behavior

When the backend starts, it:

- Creates missing database tables using SQLAlchemy metadata.
- Syncs development user preference columns.
- Syncs development message columns.
- Enables CORS for local frontend origins.
- Serves uploaded files from `/static`.
- Registers user and message API routes.

Uploaded profile photos are saved under:

```text
backend/static/uploads
```

They are served with URLs like:

```text
/static/uploads/<filename>
```

---

## API Endpoints

### User and Authentication APIs

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/users` | Register a new user |
| `POST` | `/users/` | Register a new user |
| `POST` | `/login` | Login with email and password |
| `POST` | `/login/` | Login with email and password |
| `POST` | `/user` | Create a user record |
| `GET` | `/users` | Get all users |
| `GET` | `/user/{user_id}` | Get one user by ID |
| `PATCH` | `/user/{user_id}/preferences` | Update profile and roommate preferences |
| `POST` | `/user/{user_id}/photo` | Upload a profile photo |

### Roommate Request APIs

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/requests/` | Send a roommate request |
| `GET` | `/requests/sent/{user_id}` | Get requests sent by a user |
| `GET` | `/requests/received/{user_id}` | Get requests received by a user |
| `GET` | `/requests/connections/{user_id}` | Get accepted roommate connections |
| `POST` | `/requests/{request_id}/accept?receiver_id={receiver_id}` | Accept a pending request |
| `POST` | `/requests/{request_id}/reject?receiver_id={receiver_id}` | Reject a pending request |

### Message APIs

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/messages/unread/{user_id}` | Get unread message counts grouped by sender |
| `GET` | `/messages/{current_user_id}/{other_user_id}` | Get conversation between two users |
| `POST` | `/messages/` | Send a message |
| `POST` | `/messages/read/{current_user_id}/{other_user_id}` | Mark messages as read |

---

## Database Tables

### `users`

Stores user account information, profile details, and roommate preferences.

Important fields include:

- `id`
- `username`
- `email`
- `hashed_password`
- `phone_number`
- `age`
- `occupation`
- `city`
- `street_address`
- `zip_code`
- `state`
- `country`
- `diet`
- `allergies`
- `description`
- `min_budget`
- `max_budget`
- `quiet_hours_from`
- `quiet_hours_to`
- `cleanliness`
- `social_interaction`
- `interests`
- `smoking_preference`
- `profile_photo`
- `is_active`

### `roommate_requests`

Stores roommate request records between users.

Important fields include:

- `id`
- `sender_id`
- `receiver_id`
- `status`
- `created_at`
- `updated_at`

Supported statuses:

- `pending`
- `accepted`
- `rejected`

### `messages`

Stores chat messages between users.

Important fields include:

- `id`
- `sender_id`
- `receiver_id`
- `content`
- `is_read`
- `created_at`

### `matches`

Stores generated roommate match relationships.

Important fields include:

- `id`
- `user_id`
- `matched_user_id`

---

## Generated Development Data

The backend includes a seed script for loading generated sample users, profile photos, matches, and roommate requests.

Script path:

```text
scripts/seed_generated_users.py
```

Run from the `backend` directory:

```bash
python3 scripts/seed_generated_users.py --confirm-delete
```

**Warning:** this deletes existing development data from `users`, `matches`, `roommate_requests`, and `messages`.

The script requires the `--confirm-delete` flag before it will run.

---

## CORS

CORS is configured in `main.py`.

Allowed local frontend origins include:

- `http://localhost:3000`
- `http://localhost:3001`
- `http://127.0.0.1:3000`
- `http://127.0.0.1:3001`
- `http://10.0.0.132:3000`
- `http://10.0.0.16:3000`

If the frontend runs on another origin, add it to the `allow_origins` list in `main.py`.

---

## Troubleshooting

### Backend cannot connect to PostgreSQL

- Make sure PostgreSQL is running.
- Make sure the `smart_roommate` database exists.
- Check the username, password, host, port, and database name in `db/database.py`.

### Frontend cannot call backend

- Make sure the backend is running at `http://localhost:8000`.
- Check CORS settings in `main.py`.
- Check frontend API configuration in `frontend/lib/services/apiConfig.ts`.
- Check frontend rewrites in `frontend/next.config.ts`.

### Uploaded images do not show

- Make sure uploaded files exist under `backend/static/uploads`.
- Make sure the stored photo path starts with `/static/uploads/`.
- Make sure the backend is running so static files are served.

### Seed script fails

- Make sure the database connection is correct.
- Run the script from the `backend` directory.
- Include the required `--confirm-delete` flag.

---

## Development Notes

This backend is currently configured for local development. Before production deployment:

- Move database credentials into environment variables.
- Restrict CORS origins.
- Add production-ready authentication or session handling.
- Add database migrations with a tool such as Alembic.
- Avoid committing real user data or private credentials.
