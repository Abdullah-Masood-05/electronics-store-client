<h1 align="center">⚡ ElectroStore — Client</h1>

<p align="center">
  A modern, full-featured electronics store front-end built with React 19, Ant Design, and Firebase Authentication.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=nextdotjs&logoColor=white" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/Ant%20Design-6-0170FE?style=flat-square&logo=antdesign&logoColor=white" alt="Ant Design 6" />
  <img src="https://img.shields.io/badge/Firebase-12-FFCA28?style=flat-square&logo=firebase&logoColor=black" alt="Firebase 12" />
  <img src="https://img.shields.io/badge/Axios-1-5A29E4?style=flat-square&logo=axios&logoColor=white" alt="Axios" />
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
| Framework | [Next.js 16](https://nextjs.org) |
| UI Library | [React 19](https://react.dev) |
| Component Library | [Ant Design 6](https://ant.design) |
| Authentication | [Firebase 12](https://firebase.google.com) |
| HTTP Client | [Axios](https://axios-http.com) |
| State Management | React Context API |
| Styling | Next.js with CSS modules |

---

## Project Structure

```
electronics-store-client/
├── public/                     # Static assets
├── src/
│   ├── app/                    # Next.js App Router (pages)
│   │   ├── layout.js           # Root layout wrapper
│   │   ├── page.js             # Home page
│   │   ├── globals.css         # Global styles
│   │   ├── providers.js        # Context & provider setup
│   │   ├── login/
│   │   │   └── page.js         # Login page
│   │   ├── register/
│   │   │   └── page.js         # Registration page
│   │   ├── forgot-password/
│   │   │   └── page.js         # Password recovery page
│   │   └── admin/              # Admin section (protected)
│   │       ├── layout.js       # Admin layout
│   │       ├── dashboard/
│   │       │   └── page.js     # Admin dashboard
│   │       ├── category/
│   │       │   └── page.js     # Category management
│   │       ├── subcategory/
│   │       │   └── page.js     # Subcategory management
│   │       └── product/
│   │           ├── page.js     # Product listing
│   │           ├── create/     # Product creation page
│   │           └── [slug]/     # Product detail page
│   ├── components/
│   │   ├── AdminGuard.js       # HOC for admin route protection
│   │   ├── AdminNav.js         # Admin navigation component
│   │   ├── AuthGuard.js        # HOC for auth route protection
│   │   └── nav/
│   │       └── Header.js       # Global navigation header
│   ├── context/
│   │   └── AuthContext.js      # Auth state provider (Firebase + backend)
│   ├── hooks/
│   │   └── useAuth.js          # useAuth() hook for consuming auth context
│   ├── lib/
│   │   ├── axios.js            # Axios instance with JWT interceptors
│   │   └── firebase.js         # Firebase app initialization
│   ├── services/
│   │   ├── auth.service.js     # Backend auth API calls
│   │   ├── admin.service.js    # Admin API calls
│   │   ├── category.service.js # Category API calls
│   │   ├── product.service.js  # Product API calls
│   │   └── subcategory.service.js # Subcategory API calls
│   └── utils/
│       └── imageResize.js      # Image processing utilities
├── .env.local                  # Environment variables (not committed)
├── jsconfig.json               # JavaScript configuration
├── next.config.mjs             # Next.js configuration
└── package.json
```

---

## Architecture

```
┌──────────────────────────────────────────┐
│          Next.js App (App Router)         │
│                                           │
│  ┌─────────────────┐  ┌──────────────┐  │
│  │  AuthContext    │  │  Ant Design  │  │
│  │  (Firebase Auth │  │  Components  │  │
│  │   + Custom JWT) │  └──────────────┘  │
│  └────────┬────────┘                     │
│           │                              │
│  ┌────────▼────────┐  ┌──────────────┐  │
│  │ Axios Instance  │  │   Middleware │  │
│  │ + Interceptors  │  │   & Guards   │  │
│  │ (JWT injection) │  └──────────────┘  │
│  └────────┬────────┘                     │
└──────────┼────────────────────────────┘
           │
      ┌────▼──────┐        ┌──────────────┐
      │ REST API   │        │   Firebase   │
      │ Backend    │        │   Auth       │
      └───────────┘        └──────────────┘
```

**Navigation & Routing:**
- Next.js App Router handles page-based routing via file system (`/app/page.js`, `/app/login/page.js`, etc.)
- Route protection implemented via `AuthGuard` and `AdminGuard` HOCs wrapping route components
- Admin routes checked at component render time

**Authentication Flow:**
1. User submits credentials on `/login` or `/register`
2. Firebase Authentication verifies identity and returns an ID token
3. `AuthContext` stores the token in memory and configures Axios interceptors
4. Every API request automatically attaches `Authorization: Bearer <token>` header
5. Backend validates the Firebase JWT on each request
6. On `401` response, Axios response interceptor triggers logout, clearing auth state

**Data Flow:**
- Components consume auth state via `useAuth()` hook from `AuthContext`
- API calls made via service layer (`auth.service.js`, `product.service.js`, etc.)
- Services use the configured Axios instance, which automatically injects the JWT token
- Token remains in memory only (never persisted to `localStorage` to reduce XSS risk)

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
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

# Backend API base URL
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

> Note: `NEXT_PUBLIC_*` variables are exposed to the client. Firebase API keys are intentionally public and should not be considered sensitive credentials.



### Running the App

```bash
# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The app will automatically reload when you make changes to files in the `src/app` directory.

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



## Security

| Concern | Approach |
|---|---|
| Token storage | In-memory only — never `localStorage` or `sessionStorage` |
| XSS exposure | Tokens are not accessible via `document.cookie` or `localStorage` |
| Expired tokens | Global Axios 401 interceptor automatically logs out the user |
| Route protection | `AuthGuard` and `AdminGuard` HOCs redirect unauthorized users before rendering |
| Firebase config | All keys loaded from `process.env.NEXT_PUBLIC_*` — never hard-coded |

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Next.js development server on port 3000 |
| `npm run build` | Build the app for production |
| `npm start` | Start the production server |

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
