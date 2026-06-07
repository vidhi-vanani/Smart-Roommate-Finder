# Smart Roommate Finder - Frontend

This is the Next.js frontend for the Smart Roommate Finder application. It provides the user interface for registration, login, profile preferences, browsing users, roommate requests, accepted connections, messaging, and unread message notifications.

The frontend communicates with the FastAPI backend through API helpers in `lib/services`.

---

## Tech Stack

- **Next.js 16.2.6**
- **React 19.2.4**
- **TypeScript**
- **Tailwind CSS 4**
- **ESLint**

---

## Prerequisites

- Node.js
- npm
- Backend server running at `http://127.0.0.1:8000`

---

## Installation

From the `frontend` directory:

```bash
npm install
```

---

## Running the Development Server

```bash
npm run dev
```

Open the frontend in your browser:

```text
http://localhost:3000
```

---

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Starts the Next.js development server |
| `npm run build` | Creates a production build |
| `npm start` | Starts the production server after building |
| `npm run lint` | Runs ESLint |

---

## API Configuration

API endpoints are defined in:

```text
lib/services/apiConfig.ts
```

During development, the frontend uses:

```text
/api
```

The Next.js rewrite in `next.config.ts` forwards these requests to the local backend:

```text
/api/:path* -> http://127.0.0.1:8000/:path*
```

For production, the app can use:

```text
NEXT_PUBLIC_API_URL
```

If `NEXT_PUBLIC_API_URL` is not set in production, the frontend falls back to `/api`.

---

## Frontend Project Structure

```text
frontend/
├── app/
│   ├── login/
│   │   └── page.tsx
│   ├── preferences/
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── login/
│   │   └── LoginForm.tsx
│   ├── notifications/
│   │   └── NotificationMenu.tsx
│   ├── preferences/
│   │   ├── PreferenceForm.tsx
│   │   └── types.ts
│   └── registration/
│       └── RegistrationForm.tsx
├── lib/
│   ├── compatibility/
│   │   ├── cosine.ts
│   │   ├── index.ts
│   │   ├── ranking.ts
│   │   ├── tokenizers.ts
│   │   ├── types.ts
│   │   └── vector.ts
│   └── services/
│       ├── apiConfig.ts
│       └── auth.ts
├── public/
├── AGENTS.md
├── CLAUDE.md
├── COMPONENT_STRUCTURE.md
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── package-lock.json
├── postcss.config.mjs
├── README.md
└── tsconfig.json
```

---

## Important Files and Folders

- **`app/page.tsx`** - Main home page for browsing users, requests, connections, and messages.
- **`app/login/page.tsx`** - Login page.
- **`app/register/page.tsx`** - Registration page.
- **`app/preferences/page.tsx`** - User profile and roommate preference form.
- **`app/layout.tsx`** - Root application layout.
- **`app/globals.css`** - Global styles.
- **`components/login/LoginForm.tsx`** - Login form UI, validation, backend login request, and local session storage.
- **`components/registration/RegistrationForm.tsx`** - Registration form UI, validation, backend registration request, and registration flow.
- **`components/preferences/PreferenceForm.tsx`** - Reusable profile and roommate preference form UI.
- **`components/preferences/types.ts`** - TypeScript types for preference form data.
- **`components/notifications/NotificationMenu.tsx`** - Notification UI for roommate requests and unread messages.
- **`lib/services/apiConfig.ts`** - API base URL and endpoint configuration.
- **`lib/services/auth.ts`** - Frontend service functions for auth, users, preferences, roommate requests, messages, and unread notifications.
- **`lib/compatibility/cosine.ts`** - Cosine similarity logic for compatibility scoring.
- **`lib/compatibility/ranking.ts`** - Helpers for ranking users by compatibility.
- **`lib/compatibility/tokenizers.ts`** - Tokenization helpers used by compatibility scoring.
- **`lib/compatibility/vector.ts`** - Vector helpers used by compatibility scoring.
- **`COMPONENT_STRUCTURE.md`** - Extra documentation for frontend component organization.
- **`next.config.ts`** - Next.js configuration, including local API rewrites.
- **`eslint.config.mjs`** - ESLint configuration.
- **`postcss.config.mjs`** - PostCSS configuration for Tailwind CSS.
- **`package.json`** - npm scripts and frontend dependencies.
- **`tsconfig.json`** - TypeScript configuration.

---

## Connected Backend Features

The frontend uses the backend for:

- User registration and login.
- Fetching all users and individual user profiles.
- Updating profile and roommate preferences.
- Uploading profile photos.
- Sending roommate requests.
- Viewing sent and received roommate requests.
- Accepting and rejecting roommate requests.
- Viewing accepted roommate connections.
- Sending and reading messages.
- Loading unread message counts.
- Marking conversations as read.

---

## Running With the Backend

Start the backend first from the `backend` directory:

```bash
uvicorn main:app --reload
```

Then start the frontend from the `frontend` directory:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## Troubleshooting

### Frontend cannot reach backend

- Make sure the backend is running at `http://127.0.0.1:8000`.
- Check the rewrite configuration in `next.config.ts`.
- Check API endpoint configuration in `lib/services/apiConfig.ts`.
- Confirm the backend CORS settings allow the frontend origin.

### Uploaded profile images do not display

- Make sure the backend is running.
- Confirm images exist in `backend/static/uploads`.
- Confirm the image path returned by the backend starts with `/static/uploads/`.

### Build or lint errors

- Run `npm install` to make sure dependencies are installed.
- Run `npm run lint` to inspect lint issues.
- Run `npm run build` to verify the production build.
