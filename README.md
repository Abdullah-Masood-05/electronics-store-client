<h1 align="center">⚡ ElectroStore — Client</h1>

<p align="center">
  A modern, full-featured electronics store front-end built with React 19, Ant Design, and Firebase Authentication.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite 7" />
  <img src="https://img.shields.io/badge/Ant%20Design-6-0170FE?style=flat-square&logo=antdesign&logoColor=white" alt="Ant Design 6" />
  <img src="https://img.shields.io/badge/Firebase-12-FFCA28?style=flat-square&logo=firebase&logoColor=black" alt="Firebase 12" />
  <img src="https://img.shields.io/badge/React%20Router-7-CA4245?style=flat-square&logo=reactrouter&logoColor=white" alt="React Router 7" />
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="MIT License" />
</p>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the App](#running-the-app)
- [Authentication Flow](#authentication-flow)
- [Security](#security)
- [Available Scripts](#available-scripts)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**ElectroStore** is a full-stack electronics e-commerce platform. This repository contains the **React client**, which handles all user-facing interactions — authentication, browsing, and account management — while communicating with a separate REST API backend.

The client uses **Firebase Authentication** for identity management combined with a **custom backend** for business logic and data persistence, following a dual-auth pattern where Firebase issues JWTs that the backend validates on every request.

---

## Features

- **Authentication** — Email/password registration and login via Firebase, with full error handling and user-friendly messages
- **Protected Routes** — Route-level access control; unauthenticated users are automatically redirected to `/login`
- **Persistent Sessions** — Firebase `onAuthStateChanged` listener re-hydrates the session on page reload without requiring re-login
- **User Dashboard** — Personalized home page showing cart items, wishlist, and account info
- **Responsive Navigation** — Top header with active-route highlighting, user avatar dropdown, and sign-out
- **Global 401 Handling** — Axios response interceptor automatically logs the user out on expired or invalid tokens
- **In-Memory Token Storage** — Firebase JWT is stored only in memory (never in `localStorage`) to reduce XSS exposure

---

## Tech Stack

| Category | Technology |
|---|---|
| UI Framework | [React 19](https://react.dev) |
| Build Tool | [Vite 7](https://vite.dev) + SWC |
| Component Library | [Ant Design 6](https://ant.design) |
| Routing | [React Router DOM 7](https://reactrouter.com) |
| Authentication | [Firebase 12](https://firebase.google.com) |
| HTTP Client | [Axios](https://axios-http.com) |
| State Management | React Context API |
| Linting | ESLint 9 |

---

## Project Structure

```
electronics-store-client/
├── public/                     # Static assets
├── src/
│   ├── assets/                 # Images, icons, fonts
│   ├── components/
│   │   └── nav/
│   │       └── Header.jsx      # Global navigation bar
│   ├── context/
│   │   └── AuthContext.jsx     # Auth state provider (Firebase + backend)
│   ├── features/
│   │   └── auth/
│   │       ├── Login.jsx       # Login page
│   │       └── Register.jsx    # Registration page
│   ├── firebase/
│   │   └── firebase.js         # Firebase app initialization
│   ├── hooks/
│   │   └── useAuth.js          # useAuth() convenience hook
│   ├── lib/
│   │   └── axios.js            # Axios instance + interceptors
│   ├── pages/
│   │   └── Home.jsx            # Authenticated home / dashboard
│   ├── routes/
│   │   └── PrivateRoute.jsx    # HOC for protected routes
│   ├── services/
│   │   └── auth.service.js     # Backend auth API calls
│   ├── App.jsx                 # Root component & route definitions
│   ├── main.jsx                # React entry point
│   └── index.css               # Global styles & CSS variables
├── .env.local                  # Environment variables (not committed)
├── index.html
├── vite.config.js
└── package.json
```

---

## Architecture

```
┌─────────────────────────────────────────┐
│                 React App                │
│                                          │
│  ┌──────────────┐   ┌─────────────────┐ │
│  │  AuthContext  │   │   Ant Design UI  │ │
│  │  (Firebase    │   │   Components     │ │
│  │   + Backend)  │   └─────────────────┘ │
│  └──────┬───────┘                        │
│         │                                │
│  ┌──────▼───────┐   ┌─────────────────┐ │
│  │  Axios Inst.  │   │  React Router   │ │
│  │  + JWT        │   │  PrivateRoutes  │ │
│  │  Interceptors │   └─────────────────┘ │
│  └──────┬───────┘                        │
└─────────┼───────────────────────────────┘
          │
    ┌─────▼──────┐        ┌──────────────┐
    │  REST API   │        │   Firebase   │
    │  Backend    │        │   Auth       │
    └────────────┘        └──────────────┘
```

**Data flow:**
1. User submits credentials → Firebase verifies identity and returns an ID token
2. `AuthContext` stores the token in memory and injects it into Axios via `setAxiosToken()`
3. Every API request automatically attaches `Authorization: Bearer <token>` via the Axios request interceptor
4. The backend validates the Firebase JWT on each request
5. On a `401` response, the Axios response interceptor calls the registered `logout` callback, clearing all state

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) ≥ 18
- [npm](https://www.npmjs.com) ≥ 9
- A [Firebase](https://console.firebase.google.com) project with **Email/Password** authentication enabled
- The ElectroStore backend running locally or deployed

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/electronics-store-client.git
cd electronics-store-client

# Install dependencies
npm install
```

### Environment Variables

Create a `.env.local` file in the project root and populate it with your credentials:

```env
# Firebase configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_APP_ID=your_firebase_app_id

# Backend API base URL
VITE_API_URL=http://localhost:8000/api
```

> **Never commit `.env.local`** — it is excluded by `.gitignore` by default.

### Running the App

```bash
# Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Authentication Flow

```
Register                              Login
────────                              ─────
User fills form                       User fills form
       │                                     │
       ▼                                     ▼
Firebase createUser...            Firebase signIn...
       │                                     │
       ▼                                     ▼
Get Firebase ID Token              Get Firebase ID Token
       │                                     │
       ▼                                     ▼
POST /auth/create-or-update        GET /auth/me
(Create user record in DB)         (Fetch backend profile)
       │                                     │
       └──────────────┬──────────────────────┘
                      ▼
            Store token in memory
            Set Axios Authorization header
            Update AuthContext state
            Redirect to "/"
```

---

## Security

| Concern | Approach |
|---|---|
| Token storage | In-memory only — never `localStorage` or `sessionStorage` |
| XSS exposure | Tokens are not accessible via `document.cookie` or `localStorage` |
| Expired tokens | Global Axios 401 interceptor calls `logout()` automatically |
| Route protection | `PrivateRoute` redirects unauthenticated users before rendering |
| Firebase config | All keys loaded from `import.meta.env` — never hard-coded |

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite development server with HMR |
| `npm run build` | Build the app for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Lint the codebase with ESLint |

---

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes using [Conventional Commits](https://www.conventionalcommits.org): `git commit -m "feat: add my feature"`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

Please follow the existing code style and make sure `npm run lint` passes before submitting.

---

## License

This project is licensed under the [MIT License](LICENSE).