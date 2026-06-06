# Smart Roommate Finder

Smart Roommate Finder is a full-stack web application that helps users find compatible roommates based on personal details, lifestyle preferences, housing needs, and communication between matched users.

The project includes a **Next.js frontend**, a **FastAPI backend**, and a **PostgreSQL database**.

---

## Features

- **User registration and login:** users can create an account and sign in using email and password.
- **User profiles:** users can store personal information such as age, occupation, city, address, diet, allergies, phone number, and description.
- **Roommate preferences:** users can save preferences such as budget range, quiet hours, cleanliness, social interaction, interests, and smoking preference.
- **Profile photo upload:** users can upload a profile picture, which is stored by the backend and served from the static uploads folder.
- **Browse users:** the frontend can display registered users from the database.
- **Roommate requests:** users can send roommate requests to other users.
- **Request management:** users can view sent requests, received requests, accepted connections, and can accept or reject incoming requests.
- **Messaging:** users can send and receive messages with other users.
- **Unread notifications:** the backend tracks unread messages and supports marking messages as read.
- **Generated sample data:** the backend includes a seed script that can insert 500 generated users with matches and roommate requests for testing.

---

## Tech Stack

### Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- ESLint

### Backend

- Python
- FastAPI
- Uvicorn
- SQLAlchemy
- Pydantic
- Passlib / bcrypt
- python-multipart

### Database

- PostgreSQL

---

## Project Structure

```text
Smart-Roommate-Finder/
├── backend/
│   ├── db/
│   │   ├── database.py
│   │   └── schema_sync.py
│   ├── model/
│   │   ├── user.py
│   │   ├── matches.py
│   │   ├── request.py
│   │   └── message.py
│   ├── routes/
│   │   ├── user.py
│   │   └── message.py
│   ├── schemas/
│   │   ├── user.py
│   │   └── message.py
│   ├── scripts/
│   │   └── seed_generated_users.py
│   ├── services/
│   ├── main.py
│   ├── seed_users.sql
│   └── README.md
├── frontend/
│   ├── app/
│   │   ├── login/
│   │   ├── preferences/
│   │   ├── register/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   ├── lib/
│   │   ├── compatibility/
│   │   └── services/
│   ├── public/
│   └── package.json
└── README.md
```

---

## Database Setup

The backend uses PostgreSQL with SQLAlchemy.

The database connection is configured in:

```text
backend/db/database.py
```

Current local database URL:

```python
URL_DATABASE = "postgresql://postgres:1234@localhost:5433/smart_roommate"
```

Before running the backend, make sure PostgreSQL is running and create the database:

```sql
CREATE DATABASE smart_roommate;
```

If your local PostgreSQL username, password, host, port, or database name is different, update the connection string in `backend/db/database.py`.

---

## Database Tables

### `users`

Stores user account information, profile details, and roommate preferences.

Important fields:

- `id`
- `username`
- `email`
- `hashed_password`
- `phone_number`
- `age`
- `diet`
- `allergies`
- `description`
- `street_address`
- `city`
- `zip_code`
- `state`
- `country`
- `occupation`
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

### `matches`

Stores generated roommate match relationships.

Fields:

- `id`
- `user_id`
- `matched_user_id`

### `roommate_requests`

Stores roommate requests between users.

Fields:

- `id`
- `sender_id`
- `receiver_id`
- `status`
- `created_at`
- `updated_at`

Request status values:

- `pending`
- `accepted`
- `rejected`

### `messages`

Stores chat messages between users.

Fields:

- `id`
- `sender_id`
- `receiver_id`
- `content`
- `is_read`
- `created_at`

---

## Backend Setup

### 1. Go to the backend folder

```bash
cd backend
```

### 2. Install backend dependencies

```bash
pip install fastapi uvicorn sqlalchemy psycopg2-binary python-jose "passlib[bcrypt]" python-multipart
```

### 3. Run the backend server

```bash
uvicorn main:app --reload
```

Backend URL:

```text
http://localhost:8000
```

FastAPI documentation:

```text
http://localhost:8000/docs
```

---

## Backend Details

The backend entry point is:

```text
backend/main.py
```

When the backend starts, it:

- Creates missing database tables.
- Syncs missing user preference columns for development.
- Syncs missing message columns for development.
- Enables CORS for local frontend URLs.
- Serves uploaded static files from `/static`.
- Registers user routes and message routes.

---

## Frontend Setup

### 1. Go to the frontend folder

```bash
cd frontend
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Run the frontend development server

```bash
npm run dev
```

Frontend URL:

```text
http://localhost:3000
```

---

## Frontend Details

Main frontend pages:

- **Home page:** `frontend/app/page.tsx`
- **Login page:** `frontend/app/login/page.tsx`
- **Register page:** `frontend/app/register/page.tsx`
- **Preferences page:** `frontend/app/preferences/page.tsx`

Frontend API configuration:

```text
frontend/lib/services/apiConfig.ts
```

In development, the frontend uses:

```text
/api
```

For production, it can use:

```text
NEXT_PUBLIC_API_URL
```

---

## API Endpoints

### User APIs

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/users` | Register a new user |
| `POST` | `/login` | Login with email and password |
| `POST` | `/user` | Create a user record |
| `GET` | `/users` | Get all users |
| `GET` | `/user/{user_id}` | Get one user by ID |
| `PATCH` | `/user/{user_id}/preferences` | Update user preferences |
| `POST` | `/user/{user_id}/photo` | Upload a user profile photo |

### Roommate Request APIs

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/requests/` | Send a roommate request |
| `GET` | `/requests/sent/{user_id}` | Get requests sent by a user |
| `GET` | `/requests/received/{user_id}` | Get requests received by a user |
| `GET` | `/requests/connections/{user_id}` | Get accepted roommate connections |
| `POST` | `/requests/{request_id}/accept` | Accept a roommate request |
| `POST` | `/requests/{request_id}/reject` | Reject a roommate request |

### Message APIs

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/messages/{current_user_id}/{other_user_id}` | Get conversation between two users |
| `POST` | `/messages/` | Send a message |
| `GET` | `/messages/unread/{user_id}` | Get unread message counts |
| `POST` | `/messages/read/{current_user_id}/{other_user_id}` | Mark conversation messages as read |

---

## Generated Development Data

The backend includes a script for loading generated sample users into the local database.

Seed script:

```text
backend/scripts/seed_generated_users.py
```

The script reads generated CSV data from:

```text
/Users/vidhivanani/Downloads/Samle data generation/users_output.csv
```

### What the seed script does

- Deletes existing records from `messages`, `matches`, `roommate_requests`, and `users`.
- Inserts 500 generated users.
- Hashes user passwords before saving.
- Uses generated user data such as name, address, preferences, and profile photo path.
- Copies profile photos into `backend/static/uploads`.
- Stores photo URLs as `/static/uploads/<filename>.jpg`.
- Creates directed matches.
- Creates accepted, pending, and rejected roommate requests.

### Run the seed script

From the `backend` folder:

```bash
python3 scripts/seed_generated_users.py --confirm-delete
```

**Warning:** this deletes existing development data from `users`, `matches`, `roommate_requests`, and `messages`.

The script will not run unless `--confirm-delete` is provided.

---

## Running the Full Project

Open two terminals.

### Terminal 1: backend

```bash
cd backend
uvicorn main:app --reload
```

### Terminal 2: frontend

```bash
cd frontend
npm run dev
```

Then open:

```text
http://localhost:3000
```

---

## CORS Configuration

CORS is configured in:

```text
backend/main.py
```

Allowed local frontend origins include:

- `http://localhost:3000`
- `http://localhost:3001`
- `http://127.0.0.1:3000`
- `http://127.0.0.1:3001`

If the frontend runs on a different URL, add that URL to the `allow_origins` list in `backend/main.py`.

---

## Useful Commands

### Backend

```bash
cd backend
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Frontend production build

```bash
cd frontend
npm run build
npm start
```

### Seed generated users

```bash
cd backend
python3 scripts/seed_generated_users.py --confirm-delete
```

---

## Troubleshooting

### Backend cannot connect to database

- Make sure PostgreSQL is running.
- Make sure the `smart_roommate` database exists.
- Check the username, password, host, and port in `backend/db/database.py`.

### Frontend cannot call backend

- Make sure the backend is running on `http://localhost:8000`.
- Check CORS settings in `backend/main.py`.
- Check frontend API configuration in `frontend/lib/services/apiConfig.ts`.

### Uploaded images do not show

- Make sure the backend is running.
- Make sure uploaded files exist under `backend/static/uploads`.
- Make sure the image path starts with `/static/uploads/`.

### Seed script fails

- Make sure the CSV file exists at the expected path.
- Make sure the database connection is correct.
- Run the script from the `backend` folder.
- Include the required `--confirm-delete` flag.

---

## Security Notes

This project is currently configured for local development.

Before production deployment:

- Move database credentials into environment variables.
- Add proper JWT or session-based authentication.
- Restrict CORS origins.
- Add database migrations with Alembic.
- Avoid committing real user data or private files.

---

## Summary

Smart Roommate Finder combines a Next.js frontend, FastAPI backend, and PostgreSQL database to help users find compatible roommates. The system supports registration, login, profile preferences, generated match data, roommate requests, profile photos, and messaging.
