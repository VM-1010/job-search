# BACKEND_API.md — Job Platform Backend Reference

> **Audience:** Frontend developers building the React frontend.  
> You do **not** need to read the backend source code. Everything you need is here.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Folder Structure](#folder-structure)
3. [Environment Variables](#environment-variables)
4. [Startup Instructions](#startup-instructions)
5. [Database Schema Overview](#database-schema-overview)
6. [Relationship Diagram](#relationship-diagram)
7. [Middleware Explanation](#middleware-explanation)
8. [API Endpoints](#api-endpoints)
9. [Response Conventions](#response-conventions)
10. [API Usage Examples](#api-usage-examples)

---

## Project Overview

A minimal MERN job-searching platform for a one-day university demonstration.

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB via Mongoose
- **Authentication:** Clerk (token verification only — no custom auth)
- **File Uploads:** Multer (PDF resumes stored on disk)
- **Base URL (development):** `http://localhost:5000`

---

## Folder Structure

```
backend/
├── .env                     # Your local environment variables (not committed)
├── .env.example             # Template for environment variables
├── package.json
└── src/
    ├── config/
    │   ├── db.js            # Mongoose connection helper
    │   ├── clerk.js         # Clerk client export
    │   └── multer.js        # Multer disk storage + PDF filter config
    ├── controllers/
    │   ├── userController.js           # POST /api/auth/sync
    │   ├── dashboardController.js      # GET /api/dashboard, GET /api/emp/dashboard
    │   ├── jobController.js            # Job CRUD for seekers and employers
    │   ├── applicationController.js    # Apply, list, delete, status update
    │   ├── profileController.js        # User profile CRUD
    │   ├── companyProfileController.js # Employer company profile CRUD
    │   └── uploadController.js         # Resume PDF upload
    ├── middleware/
    │   ├── auth.js           # requireUser — verifies Clerk token, attaches req.dbUser
    │   ├── employerAuth.js   # requireEmployer — verifies Clerk token, attaches req.dbEmployer
    │   ├── errorHandler.js   # Global Express error handler
    │   └── upload.js         # Re-exports multer instance
    ├── models/
    │   ├── User.js           # Job seeker MongoDB document
    │   ├── Employer.js       # Employer MongoDB document
    │   ├── Job.js            # Job listing
    │   ├── Application.js    # Job application
    │   ├── Profile.js        # Job seeker profile
    │   └── CompanyProfile.js # Employer company profile
    ├── routes/
    │   ├── userRoutes.js         # /api/auth
    │   ├── dashboardRoutes.js    # /api/dashboard
    │   ├── jobRoutes.js          # /api/jobs
    │   ├── applicationRoutes.js  # /api/applications
    │   ├── profileRoutes.js      # /api/profile
    │   ├── uploadRoutes.js       # /api/upload
    │   └── employerRoutes.js     # /api/emp/*
    ├── uploads/              # Stored resume PDFs (served at /uploads/<filename>)
    ├── app.js                # Express app setup (middleware + routes)
    └── server.js             # Entry point — connects DB then starts server
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your values.

```env
MONGO_URI=mongodb://localhost:27017/job_platform
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxx
CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxx
PORT=5000
CLIENT_URL=http://localhost:5173
```

| Variable                | Description                                       |
|-------------------------|---------------------------------------------------|
| `MONGO_URI`             | MongoDB connection string                         |
| `CLERK_SECRET_KEY`      | From Clerk dashboard → API Keys                   |
| `CLERK_PUBLISHABLE_KEY` | From Clerk dashboard → API Keys                   |
| `PORT`                  | Port for Express server (default 5000)            |
| `CLIENT_URL`            | Frontend origin for CORS (default localhost:5173) |

---

## Startup Instructions

```bash
# 1. Install dependencies
npm install

# 2. Create and fill in your .env file
cp .env.example .env

# 3. Start in development mode (auto-restarts on change)
npm run dev

# 4. Or start in production mode
npm start
```

The server will log:
```
MongoDB connected: localhost
Server running on http://localhost:5000
```

---

## Database Schema Overview

### User
```
_id       ObjectId (auto)
clerkId   String (unique) — Clerk user ID
role      String          — always "user"
```

### Employer
```
_id       ObjectId (auto)
clerkId   String (unique) — Clerk user ID
role      String          — always "employer"
```

### Job
```
_id            ObjectId (auto)
employer       ObjectId → Employer
title          String
company        String
description    String
additionalInfo String
salaryMin      Number
salaryMax      Number
location       String
category       String
createdAt      Date (auto)
updatedAt      Date (auto)
```

### Application
```
_id        ObjectId (auto)
user       ObjectId → User
employer   ObjectId → Employer
job        ObjectId → Job
status     String  — "Pending" | "Interview" | "Accepted" | "Rejected"
appliedAt  Date    — defaults to now
createdAt  Date (auto)
updatedAt  Date (auto)
```

### Profile
```
_id           ObjectId (auto)
user          ObjectId → User (unique, one-to-one)
name          String
place         String
contact       String
resumeUrl     String  — path like "/uploads/filename.pdf"
about         String
education     [String]
experience    [String]
training      [String]
competitions  [String]
createdAt     Date (auto)
updatedAt     Date (auto)
```

### CompanyProfile
```
_id          ObjectId (auto)
employer     ObjectId → Employer (unique, one-to-one)
companyName  String
logo         String  — URL or path to logo image
description  String
category     String
createdAt    Date (auto)
updatedAt    Date (auto)
```

---

## Relationship Diagram

```
Clerk
  |                                       |
(clerkId)                             (clerkId)
  |                                       |
User <------- Profile (1:1)        Employer <--- CompanyProfile (1:1)
  |                                       |
  +-------------- Application ------------+
                       |
                      Job -------------- Employer (FK)
```

- **User** and **Employer** are separate collections, both identified by Clerk user ID.
- **Profile** has a one-to-one relationship with **User**.
- **CompanyProfile** has a one-to-one relationship with **Employer**.
- **Application** connects a **User**, a **Job**, and an **Employer**.
- **Job** belongs to an **Employer**.

---

## Middleware Explanation

### `clerkMiddleware()` (from `@clerk/express`)
Parses the Clerk session token from the `Authorization` header (`Bearer <token>`).
Must be applied **before** `requireUser` or `requireEmployer`.

### `requireUser` (`src/middleware/auth.js`)
- Calls `getAuth(req)` to retrieve `userId` from the parsed Clerk token.
- Looks up the **User** document in MongoDB by `clerkId`.
- If no document exists, creates one (first login auto-registration).
- Attaches `req.dbUser` and `req.clerkId` to the request.
- Returns `401` if no valid Clerk token is present.

### `requireEmployer` (`src/middleware/employerAuth.js`)
Same as `requireUser` but for the **Employer** collection.
Attaches `req.dbEmployer` and `req.clerkId`.

### `errorHandler` (`src/middleware/errorHandler.js`)
Global Express error handler. Catches any error passed via `next(err)`.
Returns `{ message }` JSON with the appropriate status code.

---

## API Endpoints

### How to Send Authenticated Requests

All protected endpoints require the Clerk session token in the Authorization header:

```
Authorization: Bearer <clerk_session_token>
```

Get the token from the Clerk frontend SDK:
```js
const token = await getToken(); // from useAuth() hook
```

---

### POST /api/auth/sync

**Purpose:** Call this once after a user logs in via Clerk to create the MongoDB document.
**Authentication required:** Yes (Clerk token)
**Request Body:**
```json
{ "role": "user" }
```
`role` must be `"user"` or `"employer"`.

**Response 200:**
```json
{ "role": "user", "id": "64a1b2c3d4e5f6a7b8c9d0e1" }
```

| Code | Meaning |
|------|---------|
| 200  | Synced successfully |
| 401  | Missing or invalid Clerk token |
| 500  | Server error |

---

### GET /api/dashboard

**Purpose:** Returns application counts for the logged-in job seeker.
**Authentication required:** Yes (user)

**Response 200:**
```json
{
  "applied": 5,
  "pending": 2,
  "interview": 1,
  "accepted": 1,
  "rejected": 1
}
```

---

### GET /api/jobs

**Purpose:** Returns all jobs. Supports filtering via query parameters.
**Authentication required:** Yes (user)

**Query parameters:**

| Parameter   | Type   | Description                           |
|-------------|--------|---------------------------------------|
| `company`   | string | Filter by company name (partial match)|
| `search`    | string | Search by job title (partial match)   |
| `location`  | string | Filter by location (partial match)    |
| `salaryMin` | number | Jobs whose salaryMax >= this value    |
| `salaryMax` | number | Jobs whose salaryMin <= this value    |

**Response 200:**
```json
[
  {
    "_id": "64a1...",
    "employer": "64a1...",
    "title": "Frontend Developer",
    "company": "Acme Corp",
    "description": "Build React apps",
    "additionalInfo": "Remote friendly",
    "salaryMin": 50000,
    "salaryMax": 80000,
    "location": "New York",
    "category": "Engineering",
    "createdAt": "2025-01-15T10:00:00.000Z",
    "applicantCount": 12
  }
]
```

---

### GET /api/jobs/:id

**Purpose:** Returns a single job by MongoDB `_id`.
**Authentication required:** Yes (user)

**Response 200:** Single job object with `applicantCount`.

| Code | Meaning |
|------|---------|
| 200  | Success |
| 404  | Job not found |

---

### GET /api/applications

**Purpose:** Returns all applications submitted by the logged-in user.
**Authentication required:** Yes (user)

**Response 200:**
```json
[
  {
    "_id": "64a1...",
    "job": {
      "_id": "64a1...",
      "title": "Frontend Developer",
      "company": "Acme Corp",
      "location": "New York"
    },
    "status": "Pending",
    "appliedAt": "2025-01-15T10:00:00.000Z"
  }
]
```

---

### POST /api/applications

**Purpose:** Apply to a job. Prevents duplicate applications.
**Authentication required:** Yes (user)
**Request body:**
```json
{ "jobId": "64a1b2c3d4e5f6a7b8c9d0e1" }
```

**Response 201:** Created Application object.

| Code | Meaning |
|------|---------|
| 201  | Application created |
| 400  | Missing jobId |
| 404  | Job not found |
| 409  | Already applied |

---

### DELETE /api/applications/:id

**Purpose:** Remove an application (owner only).
**Authentication required:** Yes (user)

**Response 200:**
```json
{ "message": "Application removed" }
```

---

### GET /api/profile

**Purpose:** Returns the logged-in user's profile.
**Authentication required:** Yes (user)

**Response 200:**
```json
{
  "_id": "64a1...",
  "user": "64a1...",
  "name": "Jane Doe",
  "place": "Manila",
  "contact": "+63 912 345 6789",
  "resumeUrl": "/uploads/1720000000000-resume.pdf",
  "about": "Passionate developer",
  "education": ["BS Computer Science, UP Diliman, 2024"],
  "experience": ["Junior Dev at Startup, 2023-2024"],
  "training": ["AWS Cloud Practitioner, 2024"],
  "competitions": ["Google Hash Code 2023"]
}
```

| Code | Meaning |
|------|---------|
| 200  | Success |
| 404  | Profile not yet created |

---

### PUT /api/profile

**Purpose:** Create or update the user's profile (upsert — safe to call on first use).
**Authentication required:** Yes (user)
**Request body:**
```json
{
  "name": "Jane Doe",
  "place": "Manila",
  "contact": "+63 912 345 6789",
  "about": "Passionate developer",
  "education": ["BS Computer Science, UP Diliman, 2024"],
  "experience": ["Junior Dev at Startup, 2023-2024"],
  "training": ["AWS Cloud Practitioner, 2024"],
  "competitions": ["Google Hash Code 2023"]
}
```

All fields are optional. Arrays must be arrays of strings.

**Response 200:** Updated profile object.

---

### POST /api/upload/resume

**Purpose:** Upload a PDF resume. Saves path to user's profile.
**Authentication required:** Yes (user)
**Content-Type:** `multipart/form-data`
**Form field name:** `resume` (PDF only)

**Response 200:**
```json
{
  "resumeUrl": "/uploads/1720000000000-resume.pdf",
  "profile": { }
}
```

Access file at: `http://localhost:5000/uploads/<filename>`

| Code | Meaning |
|------|---------|
| 200  | Uploaded |
| 400  | No file or non-PDF |

---

### GET /api/emp/dashboard

**Purpose:** Returns job and application stats + 10 most recent applications.
**Authentication required:** Yes (employer)

**Response 200:**
```json
{
  "jobsPosted": 4,
  "total": 20,
  "pending": 10,
  "interview": 5,
  "accepted": 3,
  "rejected": 2,
  "recentApplications": [ ]
}
```

---

### GET /api/emp/profile

**Purpose:** Returns the employer's company profile.
**Authentication required:** Yes (employer)

**Response 200:**
```json
{
  "_id": "64a1...",
  "employer": "64a1...",
  "companyName": "Acme Corp",
  "logo": "https://example.com/logo.png",
  "description": "We build software",
  "category": "Technology"
}
```

---

### PUT /api/emp/profile

**Purpose:** Create or update employer's company profile (upsert).
**Authentication required:** Yes (employer)
**Request body:**
```json
{
  "companyName": "Acme Corp",
  "logo": "https://example.com/logo.png",
  "description": "We build software",
  "category": "Technology"
}
```

**Response 200:** Updated company profile object.

---

### GET /api/emp/jobs

**Purpose:** Returns all job listings posted by the employer.
**Authentication required:** Yes (employer)

**Response 200:** Array of Job objects.

---

### POST /api/emp/jobs

**Purpose:** Create a new job listing.
**Authentication required:** Yes (employer)
**Request body:**
```json
{
  "title": "Frontend Developer",
  "company": "Acme Corp",
  "description": "Build amazing UIs",
  "additionalInfo": "Must know React",
  "salaryMin": 50000,
  "salaryMax": 80000,
  "location": "Remote",
  "category": "Engineering"
}
```

Required: `title`, `company`, `description`, `location`.

**Response 201:** Created Job object.

---

### GET /api/emp/jobs/:id

**Purpose:** Returns a single job listing owned by the employer.
**Response 200:** Job object.

---

### PUT /api/emp/jobs/:id

**Purpose:** Update a job listing (any subset of fields).
**Response 200:** Updated Job object.

---

### DELETE /api/emp/jobs/:id

**Purpose:** Delete a job listing and all its applications.
**Response 200:**
```json
{ "message": "Job deleted" }
```

---

### GET /api/emp/jobs/:id/applications

**Purpose:** Returns all applications for a specific job with applicant names.
**Authentication required:** Yes (employer)

**Response 200:**
```json
[
  {
    "_id": "64a1...",
    "user": { "_id": "64a1...", "clerkId": "user_xxx" },
    "status": "Pending",
    "appliedAt": "2025-01-15T10:00:00.000Z",
    "applicantName": "Jane Doe"
  }
]
```

---

### GET /api/emp/profile/:userId

**Purpose:** Employer views an applicant's full profile. `:userId` is the applicant's MongoDB User `_id`.
**Authentication required:** Yes (employer)

**Response 200:** Full Profile object.

---

### PUT /api/emp/applications/:id

**Purpose:** Employer updates the status of an application.
**Authentication required:** Yes (employer)
**Request body:**
```json
{ "status": "Interview" }
```

Valid values: `"Pending"`, `"Interview"`, `"Accepted"`, `"Rejected"`

**Response 200:** Updated Application object.

| Code | Meaning |
|------|---------|
| 200  | Updated |
| 400  | Invalid status value |
| 404  | Application not found |

---

## Response Conventions

All responses return JSON.

**Success:** resource object or array  
**Error:** `{ "message": "Human readable description" }`

HTTP status codes:
- `200` — OK
- `201` — Created
- `400` — Bad request (missing/invalid fields)
- `401` — Unauthorized (missing/invalid Clerk token)
- `404` — Resource not found
- `409` — Conflict (e.g. duplicate application)
- `500` — Internal server error

---

## API Usage Examples

### Sync user after Clerk login
```js
import { useAuth } from '@clerk/react';

const { getToken } = useAuth();

const syncUser = async (role) => {
  const token = await getToken();
  const res = await fetch('http://localhost:5000/api/auth/sync', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ role }),
  });
  return res.json();
};
```

### Fetch jobs with filters
```js
const getJobs = async (filters) => {
  const token = await getToken();
  const params = new URLSearchParams(filters).toString();
  const res = await fetch(`http://localhost:5000/api/jobs?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};
```

### Apply to a job
```js
const apply = async (jobId) => {
  const token = await getToken();
  const res = await fetch('http://localhost:5000/api/applications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ jobId }),
  });
  return res.json();
};
```

### Upload a resume (multipart/form-data)
```js
const uploadResume = async (file) => {
  const token = await getToken();
  const formData = new FormData();
  formData.append('resume', file);

  const res = await fetch('http://localhost:5000/api/upload/resume', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
    // Do NOT set Content-Type manually — browser sets it with the boundary
  });
  return res.json();
};
```

### Employer — create a job listing
```js
const createJob = async (jobData) => {
  const token = await getToken();
  const res = await fetch('http://localhost:5000/api/emp/jobs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(jobData),
  });
  return res.json();
};
```

### Employer — update application status
```js
const updateStatus = async (applicationId, status) => {
  const token = await getToken();
  const res = await fetch(`http://localhost:5000/api/emp/applications/${applicationId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
  return res.json();
};
```
