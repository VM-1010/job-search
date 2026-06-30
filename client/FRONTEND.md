# FRONTEND.md — Job Platform Frontend Reference

> **Tech stack:** React 19 · Vite 8 · React Router v7 · Clerk React · Tailwind CSS v4 · Radix UI (Shadcn-style)

---

## Setup Instructions

```bash
# 1. Go to the frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Create your .env file
cp .env.example .env
# Fill in VITE_CLERK_PUBLISHABLE_KEY and VITE_API_URL

# 4. Start the dev server
npm run dev
# Vite serves on http://localhost:5173

# 5. (Optional) Build for production
npm run build
```

> Make sure the backend is also running on `http://localhost:5000` (or update `VITE_API_URL`).

---

## Environment Variables

| Variable                    | Description                                            |
|-----------------------------|--------------------------------------------------------|
| `VITE_CLERK_PUBLISHABLE_KEY`| Your Clerk publishable key from clerk.com dashboard    |
| `VITE_API_URL`              | Backend base URL (default `http://localhost:5000`)     |

---

## Clerk Integration

1. Create a Clerk application at [clerk.com](https://clerk.com).
2. Copy the **Publishable Key** from **API Keys** → paste in `.env`.
3. Set **Allowed redirect URLs** to `http://localhost:5173` in Clerk dashboard.

Authentication flow:
- `ClerkProvider` wraps the entire app (`src/App.jsx`).
- Unauthenticated users see the Landing page with **Sign In / Sign Up** buttons (Clerk modal).
- After first sign-in, a **Role Picker** screen appears (Job Seeker or Employer).
- The chosen role is sent to `POST /api/auth/sync` and stored in `localStorage` (`jobplatform_role`).
- Subsequent visits detect the stored role and redirect straight to the correct dashboard.
- `UserButton` (Clerk component) in the Topbar handles sign-out. After sign-out, `localStorage` role is cleared by Clerk's `afterSignOutUrl="/"` redirect.

> **Note:** To switch roles, clear `localStorage.removeItem('jobplatform_role')` and sign out/in again.

---

## Folder Structure

```
frontend/
├── .env.example
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── api/
    │   └── api.js            # All API calls (single file)
    ├── components/
    │   ├── Sidebar.jsx
    │   ├── Topbar.jsx
    │   ├── JobCard.jsx
    │   └── ui/               # Radix-based Shadcn-style components
    │       ├── button.jsx
    │       ├── card.jsx
    │       ├── input.jsx
    │       ├── label.jsx
    │       ├── badge.jsx
    │       ├── dialog.jsx
    │       ├── select.jsx
    │       ├── table.jsx
    │       └── separator.jsx
    ├── layouts/
    │   ├── UserLayout.jsx     # Sidebar + Topbar for user pages
    │   └── EmployerLayout.jsx # Sidebar + Topbar for employer pages
    ├── lib/
    │   └── utils.js           # cn() class merge utility
    ├── pages/
    │   ├── Landing.jsx
    │   ├── Dashboard.jsx
    │   ├── Jobs.jsx
    │   ├── Applications.jsx
    │   ├── Profile.jsx
    │   ├── EmpDashboard.jsx
    │   ├── Listings.jsx
    │   ├── ListingDetails.jsx
    │   ├── CompanyProfile.jsx
    │   └── ApplicantProfile.jsx
    ├── App.jsx
    ├── main.jsx
    └── index.css
```

---

## Routes

| Path                        | Page               | Auth    |
|-----------------------------|--------------------|---------|
| `/`                         | Landing            | Public  |
| `/dashboard`                | Dashboard          | User    |
| `/jobs`                     | Jobs               | User    |
| `/applications`             | Applications       | User    |
| `/profile`                  | Profile            | User    |
| `/emp/dashboard`            | EmpDashboard       | Employer|
| `/emp/listings`             | Listings           | Employer|
| `/emp/listings/new`         | Listings (new form)| Employer|
| `/emp/listings/:id`         | ListingDetails     | Employer|
| `/emp/listings/:id/edit`    | ListingDetails (edit)| Employer|
| `/emp/profile`              | CompanyProfile     | Employer|
| `/emp/applicant/:userId`    | ApplicantProfile   | Employer|

---

## API Usage

All API calls live in `src/api/api.js`. Each function takes `getToken` (from Clerk's `useAuth()`) as its first argument.

```js
import { useAuth } from '@clerk/clerk-react';
import { getDashboard } from '@/api/api';

const { getToken } = useAuth();
const stats = await getDashboard(getToken);
```

The internal `request()` helper:
- Calls `getToken()` on every request to get a fresh Clerk session token.
- Sets `Authorization: Bearer <token>` on all requests.
- Throws an error with `.status` set to the HTTP status code on non-OK responses.
- Does **not** set `Content-Type` for `multipart/form-data` (browser sets the boundary automatically).

### Exported Functions

| Function                              | Method | Endpoint                                |
|---------------------------------------|--------|-----------------------------------------|
| `syncUser(gt, role)`                  | POST   | `/api/auth/sync`                        |
| `getDashboard(gt)`                    | GET    | `/api/dashboard`                        |
| `getJobs(gt, filters)`                | GET    | `/api/jobs`                             |
| `getJob(gt, id)`                      | GET    | `/api/jobs/:id`                         |
| `applyToJob(gt, jobId)`               | POST   | `/api/applications`                     |
| `getApplications(gt)`                 | GET    | `/api/applications`                     |
| `deleteApplication(gt, id)`           | DELETE | `/api/applications/:id`                 |
| `getProfile(gt)`                      | GET    | `/api/profile`                          |
| `updateProfile(gt, data)`             | PUT    | `/api/profile`                          |
| `uploadResume(gt, file)`              | POST   | `/api/upload/resume`                    |
| `getEmployerDashboard(gt)`            | GET    | `/api/emp/dashboard`                    |
| `getEmployerProfile(gt)`              | GET    | `/api/emp/profile`                      |
| `updateEmployerProfile(gt, data)`     | PUT    | `/api/emp/profile`                      |
| `getEmployerJobs(gt)`                 | GET    | `/api/emp/jobs`                         |
| `createJob(gt, data)`                 | POST   | `/api/emp/jobs`                         |
| `updateJob(gt, id, data)`             | PUT    | `/api/emp/jobs/:id`                     |
| `deleteJob(gt, id)`                   | DELETE | `/api/emp/jobs/:id`                     |
| `getJobApplications(gt, jobId)`       | GET    | `/api/emp/jobs/:id/applications`        |
| `updateApplicationStatus(gt, appId, status)` | PUT | `/api/emp/applications/:id`       |
| `getApplicantProfile(gt, userId)`     | GET    | `/api/emp/profile/:userId`              |
