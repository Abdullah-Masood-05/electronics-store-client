<h1 align="center">  ElectroStore Client </h1>


<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=nextdotjs&logoColor=white" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/Ant%20Design-6-0170FE?style=flat-square&logo=antdesign&logoColor=white" alt="Ant Design 6" />
  <img src="https://img.shields.io/badge/Firebase-12-FFCA28?style=flat-square&logo=firebase&logoColor=black" alt="Firebase 12" />
  <img src="https://img.shields.io/badge/Axios-1-5A29E4?style=flat-square&logo=axios&logoColor=white" alt="Axios" />
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="MIT License" />
</p>

<p align="center">
Frontend for an electronics store. Browse products, manage your account, and handle admin duties if you've got the access.
</p>

## Why This Exists

Started as a practical project to build a real e-commerce experience without the headache of payment processing or overly complex backend infrastructure. The goal was simple: authentication that actually works, a clean product browsing experience, and a proper admin section — all tied together with a REST API backend.

## Features

- **Auth** — Firebase email/password login and registration. Sessions persist across page reloads.
- **Browse products** — Categories, subcategories, individual product pages with details.
- **Admin section** — Manage products, categories, and deals if you're authorized.
- **Responsive** — Built with Ant Design, works on desktop and mobile.
- **Protected routes** — Unauthorized users get redirected to login. Admin pages are actually locked down.

## Tech Stack

Next.js 16, React 19, Ant Design 6, Firebase 12, Axios, and the Context API for state management.

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- A Firebase project set up with Email/Password auth
- The backend API running (or a URL to one)

### Setup

```bash
git clone https://github.com/your-username/electronics-store-client.git
cd electronics-store-client
npm install
```

Create a `.env.local` file:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### Run It

```bash
npm run dev
```

Open `http://localhost:3000` and you're good to go.

## Project Layout

```
src/
├── app/              # Next.js pages (App Router)
│   ├── login/
│   ├── register/
│   ├── admin/        # Protected admin routes
│   └── products/
├── components/       # Reusable React components
├── context/          # AuthContext for auth state
├── hooks/            # useAuth() hook
├── lib/              # Firebase and Axios setup
├── services/         # API calls
└── utils/            # Helpers
```

## How It Works

1. **Login** — User submits credentials, Firebase authenticates, we get a token
2. **Token handling** — Token stays in memory, automatically attached to API requests
3. **Routes** — `AuthGuard` and `AdminGuard` components protect pages before they render
4. **API calls** — Services use an Axios instance that auto-injects the auth token
5. **Logout** — If the token expires (401 response), we automatically log you out

No `localStorage` for tokens — they live in memory only to avoid XSS vulnerabilities.

## Commands

```bash
npm run dev      # Dev server
npm run build    # Build for production
npm start        # Run production build
```

## Notes

- This is a frontend only. You need the backend API running for anything to work.
- Firebase auth is configured through environment variables. Make sure they're set up right or nothing will authenticate.
- The admin section exists but requires actual admin privileges on the backend — the frontend just gates the routes.
- Images are resized client-side to keep requests smaller.

## License

MIT
