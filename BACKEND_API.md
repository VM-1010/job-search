# Backend API Reference

This document describes the implemented backend API for the Job Hunting Platform. It documents only the code present under `server/` and is intended as the frontend source of truth.

## Project Overview

- Purpose: backend API for a job search and recruiting platform with job seeker accounts, recruiter accounts, company profiles, job listings, applications, saved jobs, notifications, and dashboards.
- Runtime: Node.js with ES modules.
- Framework: Express 5.
- Database: MongoDB via Mongoose.
- Authentication: JWT signed with `JWT_SECRET`, stored in an HTTP-only `token` cookie and also returned in auth responses. Protected routes also accept `Authorization: Bearer <token>`.
- Password hashing: bcrypt.
- Validation: `express-validator` route validation plus Mongoose schema validation.
- Google OAuth: Passport Google OAuth 2.0 for seeker login/register flow.
- Base API URL: server listens on `PORT || 5000`; API routes are mounted under `http://localhost:5000/api` by default.
- CORS: origin is `CLIENT_URL || http://localhost:5173`; credentials are enabled.

### Architecture

`server/app.js` configures middleware, Passport, routes, root health response, and error middleware. `server/server.js` loads `../.env`, connects MongoDB, and starts the HTTP server.

### Folder Structure

```text
server/
  app.js
  server.js
  config/
    db.js
    passport.js
  controllers/
    applicationController.js
    authController.js
    companyController.js
    dashboardController.js
    jobController.js
    notificationController.js
    userController.js
  middleware/
    authMiddleware.js
    errorMiddleware.js
  models/
    applicationModel.js
    companyModel.js
    jobModel.js
    notificationModel.js
    recruiterModel.js
    userModel.js
  routes/
    applicationRoutes.js
    authRoutes.js
    companyRoutes.js
    dashboardRoutes.js
    jobRoutes.js
    notificationRoutes.js
    userRoutes.js
  utils/
    generateToken.js
```

### Environment Variables

| Name                   | Used By                                   | Required By Code      | Description                                                                   |
| ---------------------- | ----------------------------------------- | --------------------- | ----------------------------------------------------------------------------- |
| `MONGO_URI`            | `config/db.js`                            | Yes for DB connection | MongoDB connection string.                                                    |
| `PORT`                 | `server.js`                               | No                    | Server port. Defaults to `5000`.                                              |
| `NODE_ENV`             | `server.js`, cookie config, error handler | No                    | Enables production cookie `secure` flag and hides stack traces in production. |
| `JWT_SECRET`           | `generateToken.js`, `authMiddleware.js`   | No                    | JWT secret. Code falls back to `fallback_secret_key_123`.                     |
| `CLIENT_URL`           | CORS, OAuth redirects                     | No                    | Frontend origin. Defaults to `http://localhost:5173`.                         |
| `GOOGLE_CLIENT_ID`     | `config/passport.js`                      | No                    | Google OAuth client ID. Defaults to `dummy_id`.                               |
| `GOOGLE_CLIENT_SECRET` | `config/passport.js`                      | No                    | Google OAuth client secret. Defaults to `dummy_secret`.                       |

## Authentication Strategy

JWT payload:

```json
{
  "id": "USER_OR_RECRUITER_ID",
  "accountType": "seeker"
}
```

`accountType` is either `seeker` or `recruiter`. Tokens expire in 30 days.

`generateToken(res, userId, accountType)` signs the token, sets a cookie named `token`, and returns the token string. Cookie settings:

```json
{
  "httpOnly": true,
  "secure": "true only when NODE_ENV is production",
  "sameSite": "strict",
  "maxAge": 2592000000
}
```

Protected route token lookup order:

1. `req.cookies.token`
2. `Authorization: Bearer <token>`

Frontend token storage expectation:

- Browser frontend can rely on the HTTP-only cookie when requests include credentials.
- API clients and tests can send `Authorization: Bearer <token>`.
- Auth responses also include `token` in JSON, and Google OAuth redirects with `?token=<token>`.

### Registration Sequence

```text
Frontend
  -> POST /api/auth/register/seeker or /api/auth/register/recruiter
Backend
  -> validates body
  -> checks email uniqueness across User and Recruiter collections
  -> creates document with hashed password
  -> signs JWT
  -> sets token cookie
  -> returns account payload with token
```

### Login Sequence

```text
Frontend
  -> POST /api/auth/login
Backend
  -> validates email/password
  -> looks for User by email, then Recruiter by email
  -> rejects Google-only seekers without password
  -> compares bcrypt password
  -> signs JWT
  -> sets token cookie
  -> returns seeker or recruiter payload with token
```

### Google OAuth Sequence

```text
Frontend
  -> GET /api/auth/google
Backend
  -> redirects to Google OAuth
Google
  -> GET /api/auth/google/callback
Backend
  -> finds user by googleId
  -> else links existing User by email
  -> else creates new seeker User
  -> signs seeker JWT
  -> sets token cookie
  -> redirects to CLIENT_URL/auth-success?token=<token>
```

### Role Middleware

- `protect`: validates JWT, loads `req.user` from `User` when `accountType === "seeker"` or `Recruiter` when `accountType === "recruiter"`, excludes password, and sets `req.accountType`.
- `authorize(...allowedTypes)`: returns 401 when no authenticated account is present; returns 403 when the current account type is not in `allowedTypes`.

## Database Models

All models use Mongoose timestamps unless otherwise noted, creating `createdAt` and `updatedAt`.

### User

- Collection: `users`
- Description: job seeker account with profile and embedded saved jobs.

| Field                            | Type                      | Required                                | Default    | Enum | Relationship / Notes                                    |
| -------------------------------- | ------------------------- | --------------------------------------- | ---------- | ---- | ------------------------------------------------------- |
| `name`                           | String                    | Yes                                     | None       | None | Required message: `Name is required`.                   |
| `email`                          | String                    | Yes                                     | None       | None | Unique, lowercase, trim.                                |
| `password`                       | String                    | Required only when `googleId` is absent | None       | None | Hashed before save; excluded by auth middleware.        |
| `googleId`                       | String                    | No                                      | None       | None | Unique sparse.                                          |
| `profile.headline`               | String                    | No                                      | `""`       | None |                                                         |
| `profile.about`                  | String                    | No                                      | `""`       | None |                                                         |
| `profile.location`               | String                    | No                                      | `""`       | None |                                                         |
| `profile.profilePhoto`           | String                    | No                                      | `""`       | None | Kept in sync with `profilePicture` by some controllers. |
| `profile.profilePicture`         | String                    | No                                      | `""`       | None | Kept in sync with `profilePhoto` by some controllers.   |
| `profile.education[]`            | Education subdocument     | No                                      | `[]`       | None | Has Mongoose subdocument `_id`.                         |
| `profile.experience[]`           | Experience subdocument    | No                                      | `[]`       | None | Has Mongoose subdocument `_id`.                         |
| `profile.certifications[]`       | Certification subdocument | No                                      | `[]`       | None | Has Mongoose subdocument `_id`.                         |
| `profile.projects[]`             | Project subdocument       | No                                      | `[]`       | None | Has Mongoose subdocument `_id`.                         |
| `profile.skills[]`               | Skill subdocument         | No                                      | `[]`       | None | Has Mongoose subdocument `_id`.                         |
| `profile.languages[]`            | Language subdocument      | No                                      | `[]`       | None | Has Mongoose subdocument `_id`.                         |
| `profile.socialLinks.github`     | String                    | No                                      | `""`       | None |                                                         |
| `profile.socialLinks.linkedin`   | String                    | No                                      | `""`       | None |                                                         |
| `profile.socialLinks.twitter`    | String                    | No                                      | `""`       | None |                                                         |
| `profile.socialLinks.website`    | String                    | No                                      | `""`       | None |                                                         |
| `profile.resume`                 | String                    | No                                      | `""`       | None |                                                         |
| `profile.preferences.jobTypes`   | String[]                  | No                                      | `[]`       | None |                                                         |
| `profile.preferences.locations`  | String[]                  | No                                      | `[]`       | None |                                                         |
| `profile.preferences.industries` | String[]                  | No                                      | `[]`       | None |                                                         |
| `savedJobs[]`                    | Saved job subdocument     | No                                      | `[]`       | None | Embedded list of saved jobs.                            |
| `savedJobs[].job`                | ObjectId                  | Yes                                     | None       | None | Ref `Job`.                                              |
| `savedJobs[].savedAt`            | Date                      | No                                      | `Date.now` | None |                                                         |

Subdocuments:

| Subdocument   | Fields                                                                                                                                                                                                |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Education     | `school` String default `""`, `degree` String default `""`, `fieldOfStudy` String default `""`, `startDate` Date, `endDate` Date, `description` String default `""`                                   |
| Experience    | `company` String default `""`, `position` String default `""`, `location` String default `""`, `startDate` Date, `endDate` Date, `current` Boolean default `false`, `description` String default `""` |
| Certification | `name` String default `""`, `issuer` String default `""`, `issueDate` Date, `expirationDate` Date, `credentialId` String default `""`, `credentialUrl` String default `""`                            |
| Project       | `title` String default `""`, `description` String default `""`, `link` String default `""`, `startDate` Date, `endDate` Date                                                                          |
| Skill         | `name` String default `""`, `level` String default `""`                                                                                                                                               |
| Language      | `language` String default `""`, `proficiency` String default `""`                                                                                                                                     |

Example:

```json
{
  "_id": "64f000000000000000000001",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "profile": {
    "headline": "Full Stack Developer",
    "about": "Builds MERN apps",
    "location": "Remote",
    "profilePhoto": "https://example.com/jane.jpg",
    "profilePicture": "https://example.com/jane.jpg",
    "education": [
      {
        "_id": "64f000000000000000000101",
        "school": "State University",
        "degree": "BS",
        "fieldOfStudy": "CS",
        "description": ""
      }
    ],
    "experience": [],
    "certifications": [],
    "projects": [],
    "skills": [
      {
        "_id": "64f000000000000000000102",
        "name": "React",
        "level": "Intermediate"
      }
    ],
    "languages": [],
    "socialLinks": {
      "github": "",
      "linkedin": "",
      "twitter": "",
      "website": ""
    },
    "resume": "",
    "preferences": { "jobTypes": [], "locations": [], "industries": [] }
  },
  "savedJobs": [
    {
      "_id": "64f000000000000000000103",
      "job": "64f000000000000000000020",
      "savedAt": "2026-06-28T00:00:00.000Z"
    }
  ],
  "createdAt": "2026-06-28T00:00:00.000Z",
  "updatedAt": "2026-06-28T00:00:00.000Z"
}
```

### Recruiter

- Collection: `recruiters`
- Description: recruiter account that may belong to one company.

| Field            | Type     | Required | Default | Relationship / Notes                            |
| ---------------- | -------- | -------- | ------- | ----------------------------------------------- |
| `recruiterName`  | String   | Yes      | None    | Required message: `Recruiter name is required`. |
| `email`          | String   | Yes      | None    | Unique, lowercase, trim.                        |
| `password`       | String   | Yes      | None    | Hashed before save.                             |
| `company`        | ObjectId | No       | `null`  | Ref `Company`.                                  |
| `title`          | String   | No       | `""`    |                                                 |
| `profilePicture` | String   | No       | `""`    |                                                 |

Example:

```json
{
  "_id": "64f000000000000000000010",
  "recruiterName": "Rita Recruiter",
  "email": "rita@example.com",
  "company": "64f000000000000000000011",
  "title": "Talent Lead",
  "profilePicture": "",
  "createdAt": "2026-06-28T00:00:00.000Z",
  "updatedAt": "2026-06-28T00:00:00.000Z"
}
```

### Company

- Collection: `companies`
- Description: company profile owned/managed by associated recruiters.

| Field                  | Type       | Required | Default | Relationship / Notes                                    |
| ---------------------- | ---------- | -------- | ------- | ------------------------------------------------------- |
| `companyName`          | String     | Yes      | None    | Trim.                                                   |
| `logo`                 | String     | No       | `""`    |                                                         |
| `banner`               | String     | No       | `""`    |                                                         |
| `description`          | String     | No       | `""`    |                                                         |
| `industry`             | String     | No       | `""`    |                                                         |
| `headquarters`         | String     | No       | `""`    |                                                         |
| `website`              | String     | No       | `""`    | Validated as URL in create/update routes when provided. |
| `foundedYear`          | Number     | No       | None    | Validated 1700-current year in routes when provided.    |
| `companySize`          | String     | No       | `""`    |                                                         |
| `contactEmail`         | String     | No       | `""`    | Validated as email in routes when provided.             |
| `socialLinks.linkedin` | String     | No       | `""`    |                                                         |
| `socialLinks.twitter`  | String     | No       | `""`    |                                                         |
| `socialLinks.facebook` | String     | No       | `""`    |                                                         |
| `recruiters[]`         | ObjectId[] | No       | `[]`    | Ref `Recruiter`.                                        |

Example:

```json
{
  "_id": "64f000000000000000000011",
  "companyName": "Acme Corp",
  "logo": "",
  "banner": "",
  "description": "Software company",
  "industry": "Technology",
  "headquarters": "Austin, TX",
  "website": "https://example.com",
  "foundedYear": 2020,
  "companySize": "51-200",
  "contactEmail": "jobs@example.com",
  "socialLinks": { "linkedin": "", "twitter": "", "facebook": "" },
  "recruiters": ["64f000000000000000000010"],
  "createdAt": "2026-06-28T00:00:00.000Z",
  "updatedAt": "2026-06-28T00:00:00.000Z"
}
```

### Job

- Collection: `jobs`
- Description: job listing owned by a recruiter and company.
- Index: text index on `title`, `description`, `skills`.

| Field              | Type     | Required | Default | Enum / Relationship                                                       |
| ------------------ | -------- | -------- | ------- | ------------------------------------------------------------------------- |
| `title`            | String   | Yes      | None    | Trim.                                                                     |
| `description`      | String   | Yes      | None    |                                                                           |
| `requirements`     | String   | Yes      | None    |                                                                           |
| `responsibilities` | String   | Yes      | None    |                                                                           |
| `skills`           | String[] | No       | `[]`    |                                                                           |
| `salaryRange`      | String   | No       | `""`    |                                                                           |
| `employmentType`   | String   | Yes      | None    | `Full-time`, `Part-time`, `Contract`, `Internship`, `Temporary`           |
| `experienceLevel`  | String   | Yes      | None    | `Entry Level`, `Mid Level`, `Senior Level`, `Lead / Manager`, `Executive` |
| `location`         | String   | Yes      | None    | Trim.                                                                     |
| `category`         | String   | Yes      | None    | Trim.                                                                     |
| `company`          | ObjectId | Yes      | None    | Ref `Company`.                                                            |
| `recruiter`        | ObjectId | Yes      | None    | Ref `Recruiter`.                                                          |
| `status`           | String   | No       | `Open`  | `Open`, `Closed`                                                          |

Example:

```json
{
  "_id": "64f000000000000000000020",
  "title": "Full Stack Engineer",
  "description": "Build MERN apps",
  "requirements": "Node and React skills",
  "responsibilities": "Write services",
  "skills": ["Node.js", "React"],
  "salaryRange": "",
  "employmentType": "Full-time",
  "experienceLevel": "Mid Level",
  "location": "Remote",
  "category": "Engineering",
  "company": "64f000000000000000000011",
  "recruiter": "64f000000000000000000010",
  "status": "Open",
  "createdAt": "2026-06-28T00:00:00.000Z",
  "updatedAt": "2026-06-28T00:00:00.000Z"
}
```

### Application

- Collection: `applications`
- Description: job seeker's application for a job, with immutable profile snapshot.
- Index: unique compound index `{ applicant: 1, job: 1 }`.

| Field             | Type     | Required | Default    | Enum / Relationship                                                           |
| ----------------- | -------- | -------- | ---------- | ----------------------------------------------------------------------------- |
| `applicant`       | ObjectId | Yes      | None       | Ref `User`.                                                                   |
| `recruiter`       | ObjectId | Yes      | None       | Ref `Recruiter`; copied from job at apply time.                               |
| `company`         | ObjectId | Yes      | None       | Ref `Company`; copied from job at apply time.                                 |
| `job`             | ObjectId | Yes      | None       | Ref `Job`.                                                                    |
| `coverLetter`     | String   | No       | `""`       |                                                                               |
| `status`          | String   | No       | `Applied`  | `Applied`, `Under Review`, `Shortlisted`, `Interview`, `Rejected`, `Accepted` |
| `profileSnapshot` | Object   | Yes      | None       | Captures seeker profile at time of application.                               |
| `appliedAt`       | Date     | No       | `Date.now` |                                                                               |

Profile snapshot has `_id: false` and contains:

- `name` String required
- `headline` String default `""`
- `location` String default `""`
- `resume` String default `""`
- `education[]`, `experience[]`, `certifications[]`, `projects[]`, `skills[]` using snapshot schemas with `_id: false`

Example:

```json
{
  "_id": "64f000000000000000000030",
  "applicant": "64f000000000000000000001",
  "recruiter": "64f000000000000000000010",
  "company": "64f000000000000000000011",
  "job": "64f000000000000000000020",
  "coverLetter": "I am interested.",
  "status": "Applied",
  "profileSnapshot": {
    "name": "Jane Doe",
    "headline": "Full Stack Developer",
    "location": "Remote",
    "resume": "",
    "education": [],
    "experience": [],
    "certifications": [],
    "projects": [],
    "skills": [{ "name": "React", "level": "Intermediate" }]
  },
  "appliedAt": "2026-06-28T00:00:00.000Z",
  "createdAt": "2026-06-28T00:00:00.000Z",
  "updatedAt": "2026-06-28T00:00:00.000Z"
}
```

### Notification

- Collection: `notifications`
- Description: account notification for seekers or recruiters.
- Index: `{ recipient: 1, read: 1, createdAt: -1 }`.

| Field       | Type    | Required | Default | Notes                                                |
| ----------- | ------- | -------- | ------- | ---------------------------------------------------- |
| `recipient` | Mixed   | Yes      | None    | Controllers write ObjectIds for users or recruiters. |
| `title`     | String  | Yes      | None    | Trim.                                                |
| `message`   | String  | Yes      | None    |                                                      |
| `type`      | String  | Yes      | None    | Trim. Values are not enum-restricted.                |
| `read`      | Boolean | No       | `false` |                                                      |

Known notification types produced by controllers:

- `application_received`
- `application_status_updated`

Example:

```json
{
  "_id": "64f000000000000000000040",
  "recipient": "64f000000000000000000010",
  "title": "New application received",
  "message": "Jane Doe applied for Full Stack Engineer",
  "type": "application_received",
  "read": false,
  "createdAt": "2026-06-28T00:00:00.000Z",
  "updatedAt": "2026-06-28T00:00:00.000Z"
}
```

## Relationships

- Users apply to Jobs through Applications.
- Users save Jobs through embedded `User.savedJobs[]`.
- Recruiters may have one `company` reference.
- Companies contain an array of `recruiters[]`.
- Jobs reference one Company and one Recruiter.
- Applications reference applicant User, recruiter Recruiter, company Company, and job Job.
- Notifications store `recipient` as a mixed field containing the authenticated account `_id`.

Ownership rules implemented:

- A recruiter can create a Company only when they are not already associated with a company. Creating a company writes the company `_id` to the recruiter's `company` field and initializes `company.recruiters` with that recruiter.
- A recruiter can create a Job only when associated with a company.
- A recruiter can edit/delete/close/reopen jobs only when the job's `company` equals the recruiter's `company`.
- A recruiter can view applicants and update application status only for applications/jobs belonging to the recruiter's company.
- A seeker can manage only their own profile, saved jobs, applications, dashboard, and notifications.

## API Documentation

### Root

#### `GET /`

- Auth: not required.
- Description: root API message.
- Success 200:

```json
{ "message": "Welcome to the Job Hunting Platform Backend API" }
```

### Authentication

#### `POST /api/auth/register/seeker`

- Auth: not required.
- Controller: `registerSeeker`
- Body:

| Field      | Type   | Required | Validation              | Description                                 |
| ---------- | ------ | -------- | ----------------------- | ------------------------------------------- |
| `name`     | String | Yes      | not empty, trimmed      | Seeker name.                                |
| `email`    | String | Yes      | valid email, normalized | Must be unique across users and recruiters. |
| `password` | String | Yes      | minimum length 6        | Plain password; backend hashes it.          |

- Success 201:

```json
{
  "_id": "64f000000000000000000001",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "accountType": "seeker",
  "profile": {
    "headline": "",
    "about": "",
    "location": "",
    "profilePhoto": "",
    "profilePicture": "",
    "education": [],
    "experience": [],
    "certifications": [],
    "projects": [],
    "skills": [],
    "languages": [],
    "socialLinks": {
      "github": "",
      "linkedin": "",
      "twitter": "",
      "website": ""
    },
    "resume": "",
    "preferences": { "jobTypes": [], "locations": [], "industries": [] }
  },
  "token": "JWT"
}
```

- Errors: 400 validation `{ "errors": [...] }`; 400 duplicate `{ "message": "User already exists with this email" }`.
- Notes: sets `token` cookie.
- Frontend integration: after success, set auth state to seeker, invalidate `["auth","me"]`, and navigate to seeker onboarding/profile or dashboard.

#### `POST /api/auth/register/recruiter`

- Auth: not required.
- Controller: `registerRecruiter`
- Body:

| Field            | Type     | Required | Validation              | Description                                 |
| ---------------- | -------- | -------- | ----------------------- | ------------------------------------------- |
| `recruiterName`  | String   | Yes      | not empty, trimmed      | Recruiter name.                             |
| `email`          | String   | Yes      | valid email, normalized | Must be unique across users and recruiters. |
| `password`       | String   | Yes      | minimum length 6        | Plain password.                             |
| `title`          | String   | No       | trimmed                 | Recruiter title.                            |
| `profilePicture` | String   | No       | valid URL when provided | Avatar URL.                                 |
| `company`        | ObjectId | No       | MongoId when provided   | Initial company reference.                  |

- Success 201:

```json
{
  "_id": "64f000000000000000000010",
  "recruiterName": "Rita Recruiter",
  "email": "rita@example.com",
  "accountType": "recruiter",
  "title": "",
  "profilePicture": "",
  "company": null,
  "token": "JWT"
}
```

- Errors: 400 validation; 400 duplicate.
- Notes: setting `company` during registration does not update `Company.recruiters`.
- Frontend integration: after success, navigate recruiters without `company` to create company flow. React Query key `["auth","me"]`.

#### `POST /api/auth/login`

- Auth: not required.
- Body:

| Field      | Type   | Required | Validation              |
| ---------- | ------ | -------- | ----------------------- |
| `email`    | String | Yes      | valid email, normalized |
| `password` | String | Yes      | not empty               |

- Success 200 seeker shape: same as seeker registration.
- Success 200 recruiter shape: same as recruiter registration.
- Errors:

```json
{ "message": "Invalid email or password" }
```

```json
{
  "message": "This email is linked with Google OAuth. Please login with Google."
}
```

- Notes: searches `User` first, then `Recruiter`.
- Frontend integration: credentials loading state on submit; on 401 show inline error; cache user under `["auth","me"]`.

#### `POST /api/auth/logout`

- Auth: not required.
- Success 200:

```json
{ "message": "Successfully logged out" }
```

- Notes: sets `token` cookie to empty with `expires: new Date(0)`.
- Frontend integration: clear auth caches and all role-specific query caches.

#### `GET /api/auth/me`

- Auth: required; seeker or recruiter.
- Headers: cookie `token` or `Authorization: Bearer <token>`.
- Success 200 seeker:

```json
{
  "_id": "64f000000000000000000001",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "accountType": "seeker",
  "profile": {}
}
```

- Success 200 recruiter:

```json
{
  "_id": "64f000000000000000000010",
  "recruiterName": "Rita Recruiter",
  "email": "rita@example.com",
  "accountType": "recruiter",
  "title": "Talent Lead",
  "profilePicture": "",
  "company": "64f000000000000000000011"
}
```

- Errors: 401 no/invalid token; 404 user/recruiter not found; 400 invalid account type.
- Frontend integration: primary bootstrapping query `["auth","me"]`; stale time can be moderate because account data changes through mutations.

#### `PUT /api/auth/profile`

- Auth: required; role `seeker`.
- Description: bulk seeker profile update.
- Body: any subset of `headline`, `about`, `location`, `profilePhoto`, `profilePicture`, `education`, `experience`, `certifications`, `projects`, `skills`, `languages`, `socialLinks`, `resume`, `preferences`.
- Validation: no express-validator chain on this route; Mongoose validation applies on save.
- Success 200:

```json
{
  "_id": "64f000000000000000000001",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "accountType": "seeker",
  "profile": {}
}
```

- Errors: 403 recruiter; 404 user not found.
- Notes: `profilePhoto` and `profilePicture` are synchronized when either one is provided. Social links and preferences are partially merged.
- Frontend integration: use for full profile forms; invalidate `["auth","me"]`, `["users","profile"]`, `["dashboard","user"]`.

#### `GET /api/auth/google`

- Auth: not required.
- Description: starts Google OAuth with scopes `profile` and `email`.
- Response: Passport redirect to Google.
- Frontend integration: use `window.location.href = API_BASE + "/api/auth/google"`.

#### `GET /api/auth/google/callback`

- Auth: handled by Passport Google strategy.
- Success: redirects to `${CLIENT_URL}/auth-success?token=<token>` and sets cookie.
- Failure: redirects to `${CLIENT_URL}/login`.
- Error if no `req.user`:

```json
{ "message": "Google Authentication failed" }
```

- Notes: creates or links seeker users only.

### Companies

#### `POST /api/companies`

- Auth: required; role `recruiter`.
- Body:

| Field                  | Type   | Required | Validation                |
| ---------------------- | ------ | -------- | ------------------------- |
| `companyName`          | String | Yes      | not empty, trimmed        |
| `logo`                 | String | No       | none                      |
| `banner`               | String | No       | none                      |
| `description`          | String | No       | none                      |
| `industry`             | String | No       | none                      |
| `headquarters`         | String | No       | none                      |
| `website`              | String | No       | valid URL when provided   |
| `foundedYear`          | Number | No       | integer 1700-current year |
| `companySize`          | String | No       | trimmed                   |
| `contactEmail`         | String | No       | email when provided       |
| `socialLinks.linkedin` | String | No       | none                      |
| `socialLinks.twitter`  | String | No       | none                      |
| `socialLinks.facebook` | String | No       | none                      |

- Success 201:

```json
{
  "message": "Company created successfully",
  "company": {},
  "activeJobsCount": 0,
  "recruiterCount": 1
}
```

- Errors: 400 validation; 400 `{ "message": "Recruiter is already associated with a company" }`.
- Notes: links company to recruiter and adds recruiter to company.
- Frontend integration: invalidate `["auth","me"]`, `["companies"]`, `["dashboard","recruiter"]`.

#### `GET /api/companies`

- Auth: not required.
- Query:

| Field      | Type   | Required | Description                                              |
| ---------- | ------ | -------- | -------------------------------------------------------- |
| `page`     | Number | No       | Defaults to `1`; minimum coerced to `1`.                 |
| `limit`    | Number | No       | Defaults to `10`; minimum coerced to `1`.                |
| `search`   | String | No       | Case-insensitive regex over `companyName` or `industry`. |
| `name`     | String | No       | Case-insensitive regex over `companyName`.               |
| `industry` | String | No       | Case-insensitive regex over `industry`.                  |

- Success 200:

```json
{
  "companies": [
    {
      "company": {},
      "activeJobsCount": 0,
      "recruiterCount": 1
    }
  ],
  "page": 1,
  "limit": 10,
  "total": 1,
  "totalPages": 1
}
```

- Notes: sorted by `createdAt` descending.
- Frontend integration: query key `["companies", { page, limit, search, name, industry }]`; empty state when `companies.length === 0`.

#### `GET /api/companies/:id`

- Auth: not required.
- Path: `id` MongoId.
- Success 200:

```json
{
  "company": {
    "_id": "64f000000000000000000011",
    "companyName": "Acme Corp",
    "recruiters": [
      {
        "_id": "64f000000000000000000010",
        "recruiterName": "Rita Recruiter",
        "email": "rita@example.com",
        "title": "Talent Lead",
        "profilePicture": ""
      }
    ]
  },
  "activeJobsCount": 0,
  "recruiterCount": 1
}
```

- Errors: 400 invalid ID; 404 company not found.
- Frontend integration: query key `["companies", id]`.

#### `PUT /api/companies/:id`

- Auth: required; role `recruiter`.
- Authorization: recruiter's `company` must match `:id`.
- Path: `id` MongoId.
- Body: same fields as create, all optional; `companyName` cannot be empty when provided.
- Success 200:

```json
{
  "message": "Company updated successfully",
  "company": {},
  "activeJobsCount": 1,
  "recruiterCount": 1
}
```

- Errors: 400 validation; 403 not company recruiter; 404 company not found.
- Frontend integration: invalidate `["companies", id]`, company lists, recruiter dashboard.

#### `GET /api/companies/:id/jobs`

- Auth: not required.
- Path: `id` MongoId.
- Success 200: array of open jobs populated with `companyName logo` and recruiter `recruiterName email title profilePicture`.
- Errors: 400 invalid ID; 404 company not found.
- Notes: only `status: "Open"` jobs are returned.
- Frontend integration: query key `["companies", id, "jobs"]`; empty state for no open roles.

### Jobs

#### `GET /api/jobs`

- Auth: not required.
- Query:

| Field            | Type     | Required | Behavior                                                                                                                       |
| ---------------- | -------- | -------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `search`         | String   | No       | Case-insensitive regex over title, description, skills, category, location, employmentType, plus company name/industry lookup. |
| `title`          | String   | No       | Adds case-insensitive title OR filter.                                                                                         |
| `category`       | String   | No       | Case-insensitive category filter.                                                                                              |
| `location`       | String   | No       | Case-insensitive location filter.                                                                                              |
| `employmentType` | String   | No       | Exact employmentType filter.                                                                                                   |
| `companyId`      | ObjectId | No       | Exact company id filter.                                                                                                       |
| `company`        | String   | No       | If 24-char ObjectId, exact company id; otherwise regex lookup by companyName.                                                  |
| `page`           | Number   | No       | Defaults to `1`; minimum coerced to `1`.                                                                                       |
| `limit`          | Number   | No       | Defaults to `10`; minimum coerced to `1`.                                                                                      |

- Success 200:

```json
{
  "jobs": [],
  "page": 1,
  "limit": 10,
  "total": 0,
  "totalPages": 0
}
```

- Notes: always filters `status: "Open"`; sorted by `createdAt` descending. Company is populated with `companyName logo industry headquarters website`; recruiter with `recruiterName email title profilePicture`.
- Frontend integration: query key `["jobs", filters]`; debounce search; preserve previous page data; empty state for zero jobs.

#### `GET /api/jobs/my-jobs`

- Auth: required; role `recruiter`.
- Success 200: array of jobs where `recruiter === req.user._id`, populated with company `companyName logo` and recruiter `recruiterName email title`.
- Frontend integration: query key `["jobs","my-jobs"]`; invalidate after create/edit/delete/close/reopen.

#### `GET /api/jobs/:id`

- Auth: not required.
- Path: `id` MongoId.
- Success 200: job document populated with company `companyName logo industry headquarters website companySize description contactEmail foundedYear socialLinks` and recruiter `recruiterName email title profilePicture`.
- Errors: 400 validation; 404 job not found.
- Notes: closed jobs can be viewed by id; list route returns only open jobs.
- Frontend integration: query key `["jobs", id]`; use status to disable apply button when closed.

#### `POST /api/jobs`

- Auth: required; role `recruiter`.
- Body:

| Field              | Type     | Required | Validation                  |
| ------------------ | -------- | -------- | --------------------------- |
| `title`            | String   | Yes      | not empty, trimmed          |
| `description`      | String   | Yes      | not empty                   |
| `requirements`     | String   | Yes      | not empty                   |
| `responsibilities` | String   | Yes      | not empty                   |
| `skills`           | String[] | No       | must be array when provided |
| `salaryRange`      | String   | No       | trimmed                     |
| `employmentType`   | String   | Yes      | one of job enum             |
| `experienceLevel`  | String   | Yes      | one of job enum             |
| `location`         | String   | Yes      | not empty, trimmed          |
| `category`         | String   | Yes      | not empty, trimmed          |

- Success 201:

```json
{
  "message": "Job created successfully",
  "job": {}
}
```

- Errors: 400 validation; 400 recruiter without company.
- Notes: company and recruiter are derived from authenticated recruiter, not request body. Status is set to `Open`.
- Frontend integration: invalidate `["jobs"]`, `["jobs","my-jobs"]`, `["dashboard","recruiter"]`.

#### `PUT /api/jobs/:id`

- Auth: required; role `recruiter`.
- Authorization: job company must match recruiter's company.
- Body: create fields are optional; required string fields cannot be empty when provided.
- Success 200:

```json
{
  "message": "Job updated successfully",
  "job": {}
}
```

- Errors: 400 validation; 400 recruiter without company; 403 other company; 404 job not found.
- Frontend integration: invalidate `["jobs", id]`, `["jobs"]`, `["jobs","my-jobs"]`.

#### `DELETE /api/jobs/:id`

- Auth: required; role `recruiter`.
- Authorization: job company must match recruiter's company.
- Success 200:

```json
{ "message": "Job deleted successfully" }
```

- Errors: 400 validation; 400 recruiter without company; 403 other company; 404 job not found.
- Notes: does not delete applications referencing the job.
- Frontend integration: optimistic removal from my-jobs is reasonable; rollback on error.

#### `PUT /api/jobs/:id/close`

- Auth: required; role `recruiter`.
- Authorization: job company must match recruiter's company.
- Success 200:

```json
{
  "message": "Job status updated to Closed successfully",
  "job": { "status": "Closed" }
}
```

- Frontend integration: update cached job status; invalidate job lists because public list excludes closed jobs.

#### `PUT /api/jobs/:id/reopen`

- Auth: required; role `recruiter`.
- Authorization: job company must match recruiter's company.
- Success 200:

```json
{
  "message": "Job status updated to Open successfully",
  "job": { "status": "Open" }
}
```

- Frontend integration: update cached job status; invalidate public job lists.

### Applications

#### `POST /api/applications`

- Auth: required; role `seeker`.
- Body:

| Field         | Type     | Required | Validation         |
| ------------- | -------- | -------- | ------------------ |
| `jobId`       | ObjectId | Yes      | not empty, MongoId |
| `coverLetter` | String   | No       | trimmed            |

- Success 201:

```json
{
  "message": "Application submitted successfully",
  "application": {
    "_id": "64f000000000000000000030",
    "status": "Applied",
    "coverLetter": "I am interested."
  }
}
```

- Errors: 400 validation; 400 closed job; 400 duplicate application; 404 job not found.
- Notes: creates immutable `profileSnapshot` from current seeker profile; creates recruiter notification best-effort.
- Frontend integration: disable apply when job status is closed; optimistic "applied" state is reasonable after success only; invalidate `["applications","mine"]`, `["dashboard","user"]`, notifications for recruiter if same session.

#### `GET /api/applications/my-applications`

- Auth: required; role `seeker`.
- Success 200: array of applications for authenticated seeker sorted by `createdAt` descending; populated job/company/recruiter fields.
- Frontend integration: query key `["applications","mine"]`; empty state for no applications.

#### `GET /api/applications/job/:jobId`

- Auth: required; role `recruiter`.
- Authorization: job company must match recruiter's company.
- Path: `jobId` MongoId.
- Success 200: array of applications for the job sorted by `createdAt` descending; applicant populated with `name email`.
- Errors: 400 invalid ID; 400 recruiter without company; 403 other company; 404 job not found.
- Frontend integration: query key `["applications","job", jobId]`; show empty applicant state.

#### `PUT /api/applications/:id/status`

- Auth: required; role `recruiter`.
- Authorization: application job company must match recruiter's company.
- Path: `id` MongoId.
- Body:

| Field    | Type   | Required | Validation                                                                    |
| -------- | ------ | -------- | ----------------------------------------------------------------------------- |
| `status` | String | Yes      | `Applied`, `Under Review`, `Shortlisted`, `Interview`, `Rejected`, `Accepted` |

- Success 200:

```json
{
  "message": "Application status updated to Shortlisted successfully",
  "application": { "status": "Shortlisted" }
}
```

- Errors: 400 validation; 400 recruiter without company; 403 other company; 404 application not found.
- Notes: creates seeker notification when status changes.
- Frontend integration: optimistic status update is suitable; invalidate `["applications","job", jobId]`, `["dashboard","recruiter"]`; seeker dashboard/applications become stale.

### User Profile CRUD

All routes below require auth and role `seeker`. Controllers also call `ensureSeeker`, returning `{ "message": "Only job seekers can access this resource" }` for non-seekers, though route middleware normally returns the generic authorize 403 first.

#### `GET /api/users/profile`

- Success 200:

```json
{
  "_id": "64f000000000000000000001",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "accountType": "seeker",
  "profile": {},
  "savedJobs": []
}
```

- Frontend integration: query key `["users","profile"]`.

#### Scalar Profile Updates

| Method | Endpoint                      | Body                                                      | Success Message                        |
| ------ | ----------------------------- | --------------------------------------------------------- | -------------------------------------- |
| PUT    | `/api/users/profile/headline` | `{ "headline": "..." }`; required non-empty trimmed       | `Headline updated successfully`        |
| PUT    | `/api/users/profile/about`    | `{ "about": "..." }`; required non-empty trimmed          | `About section updated successfully`   |
| PUT    | `/api/users/profile/location` | `{ "location": "..." }`; required non-empty trimmed       | `Location updated successfully`        |
| PUT    | `/api/users/profile/resume`   | `{ "resume": "..." }`; required non-empty trimmed         | `Resume updated successfully`          |
| PUT    | `/api/users/profile/picture`  | `{ "profilePicture": "..." }`; required non-empty trimmed | `Profile picture updated successfully` |

- Success 200 shape:

```json
{
  "message": "Headline updated successfully",
  "profile": {}
}
```

- Notes: picture endpoint writes both `profile.profilePicture` and `profile.profilePhoto`.
- Frontend integration: invalidate `["users","profile"]`, `["auth","me"]`, `["dashboard","user"]`; optimistic local profile patch is reasonable.

#### `PUT /api/users/profile/preferences`

- Body: `{ "preferences": { "jobTypes": [], "locations": [], "industries": [] } }`
- Validation: `preferences` optional but must be object when present.
- Success: `{ "message": "Preferences updated successfully", "profile": {} }`
- Notes: merges incoming keys into existing preferences.

#### `PUT /api/users/profile/social-links`

- Body: `{ "socialLinks": { "github": "", "linkedin": "", "twitter": "", "website": "" } }`
- Validation: `socialLinks` optional but must be object when present.
- Success: `{ "message": "Social links updated successfully", "profile": {} }`
- Notes: merges incoming keys into existing social links.

#### Profile Subdocument Routes

Each create route returns 201 with the created subdocument. Each update route returns 200 with updated subdocument. Each delete route returns 200 with a message. `:id` path params validate as MongoId.

| Resource       | POST Endpoint                       | PUT Endpoint                            | DELETE Endpoint                         | Required Body Fields  | Optional Body Fields                                                                     |
| -------------- | ----------------------------------- | --------------------------------------- | --------------------------------------- | --------------------- | ---------------------------------------------------------------------------------------- |
| Education      | `/api/users/profile/education`      | `/api/users/profile/education/:id`      | `/api/users/profile/education/:id`      | `school`              | `degree`, `fieldOfStudy`, `description`, `startDate` ISO8601, `endDate` ISO8601          |
| Experience     | `/api/users/profile/experience`     | `/api/users/profile/experience/:id`     | `/api/users/profile/experience/:id`     | `company`, `position` | `location`, `description`, `startDate` ISO8601, `endDate` ISO8601, `current` Boolean     |
| Certifications | `/api/users/profile/certifications` | `/api/users/profile/certifications/:id` | `/api/users/profile/certifications/:id` | `name`                | `issuer`, `credentialId`, `credentialUrl`, `issueDate` ISO8601, `expirationDate` ISO8601 |
| Projects       | `/api/users/profile/projects`       | `/api/users/profile/projects/:id`       | `/api/users/profile/projects/:id`       | `title`               | `description`, `link`, `startDate` ISO8601, `endDate` ISO8601                            |
| Skills         | `/api/users/profile/skills`         | `/api/users/profile/skills/:id`         | `/api/users/profile/skills/:id`         | `name`                | `level`                                                                                  |
| Languages      | `/api/users/profile/languages`      | `/api/users/profile/languages/:id`      | `/api/users/profile/languages/:id`      | `language`            | `proficiency`                                                                            |

Example create response:

```json
{
  "message": "Skill added successfully",
  "skill": {
    "_id": "64f000000000000000000102",
    "name": "React",
    "level": "Intermediate"
  }
}
```

Example not found responses:

```json
{ "message": "Skill entry not found" }
```

```json
{ "message": "Education entry not found" }
```

- Frontend integration: model each profile section with mutation keys such as `["users","profile","skills"]`; invalidate `["users","profile"]` and `["dashboard","user"]`.

### Saved Jobs

#### `GET /api/users/saved-jobs`

- Auth: required; role `seeker`.
- Success 200:

```json
{
  "savedJobs": [
    {
      "_id": "64f000000000000000000103",
      "job": {
        "_id": "64f000000000000000000020",
        "title": "Full Stack Engineer",
        "location": "Remote",
        "category": "Engineering",
        "employmentType": "Full-time",
        "experienceLevel": "Mid Level",
        "salaryRange": "",
        "status": "Open",
        "company": "64f000000000000000000011",
        "recruiter": "64f000000000000000000010",
        "createdAt": "2026-06-28T00:00:00.000Z"
      },
      "savedAt": "2026-06-28T00:00:00.000Z"
    }
  ]
}
```

- Notes: sorted newest saved first in controller.
- Frontend integration: query key `["saved-jobs"]`; empty state for no saved jobs.

#### `POST /api/users/saved-jobs/:jobId`

- Auth: required; role `seeker`.
- Path: `jobId` MongoId.
- Success 201:

```json
{ "message": "Job saved successfully" }
```

- Errors: 400 invalid ID; 400 already saved; 404 user/job not found.
- Notes: can save closed jobs if the job exists; no status check is implemented.
- Frontend integration: optimistic toggle is reasonable; invalidate `["saved-jobs"]`, `["users","profile"]`, `["dashboard","user"]`.

#### `DELETE /api/users/saved-jobs/:jobId`

- Auth: required; role `seeker`.
- Path: `jobId` MongoId.
- Success 200:

```json
{ "message": "Saved job removed successfully" }
```

- Errors: 400 invalid ID; 404 saved job not found; 404 user not found.
- Frontend integration: optimistic remove from saved list.

### Notifications

All notification routes require authentication but do not restrict account type.

#### `GET /api/notifications`

- Auth: required; seeker or recruiter.
- Success 200:

```json
{
  "notifications": []
}
```

- Notes: returns notifications where `recipient === req.user._id`, sorted newest first.
- Frontend integration: query key `["notifications"]`; poll or refetch on dashboard/application mutations if needed.

#### `PUT /api/notifications/:id/read`

- Auth: required.
- Path: `id` MongoId.
- Success 200:

```json
{
  "message": "Notification marked as read",
  "notification": { "read": true }
}
```

- Errors: 400 invalid ID; 404 notification not found.
- Authorization: notification must belong to current account.
- Frontend integration: optimistic set `read: true`.

#### `DELETE /api/notifications/:id`

- Auth: required.
- Path: `id` MongoId.
- Success 200:

```json
{ "message": "Notification deleted successfully" }
```

- Errors: 400 invalid ID; 404 notification not found.
- Authorization: notification must belong to current account.
- Frontend integration: optimistic removal from notification list.

### Dashboard

#### `GET /api/dashboard/user`

- Auth: required; role `seeker`.
- Success 200:

```json
{
  "recentApplications": [],
  "savedJobs": [],
  "totalApplications": 0,
  "applicationsByStatus": {},
  "profileCompletionPercentage": 13
}
```

- Notes: recent applications are first 5 after sorting all user applications by `createdAt` descending. Profile completion checks 15 fields/groups.
- Frontend integration: query key `["dashboard","user"]`; invalidate after profile, saved job, and application mutations.

#### `GET /api/users/dashboard`

- Auth: required; role `seeker`.
- Description: duplicate seeker dashboard route served by `userController.getUserDashboard`.
- Response: same shape as `/api/dashboard/user`.
- Frontend integration: prefer `/api/dashboard/user` for dashboard namespace consistency, but this route exists.

#### `GET /api/dashboard/recruiter`

- Auth: required; role `recruiter`.
- Success 200:

```json
{
  "activeJobs": 1,
  "closedJobs": 0,
  "totalJobs": 1,
  "totalApplications": 0,
  "recentApplications": [],
  "applicantCountsPerJob": [
    {
      "applicantCount": 3,
      "jobId": "64f000000000000000000020",
      "title": "Full Stack Engineer",
      "status": "Open"
    }
  ]
}
```

- Notes: counts are scoped to `recruiter: req.user._id`, not entire company.
- Frontend integration: query key `["dashboard","recruiter"]`; invalidate after job and application status mutations.

## Search, Filtering, Sorting, Pagination

### Jobs

- Base filter: `status: "Open"` for `GET /api/jobs`.
- Search: `search` creates regex OR filters over job `title`, `description`, `skills`, `category`, `location`, `employmentType`, and matching company IDs from company `companyName` or `industry`.
- Filters: `title`, `category`, `location`, `employmentType`, `companyId`, `company`.
- Sorting: `createdAt: -1`.
- Pagination: `page` default 1, `limit` default 10, both coerced to minimum 1.
- Response includes `jobs`, `page`, `limit`, `total`, `totalPages`.

### Companies

- Search: `search` regex over `companyName` and `industry`.
- Filters: `name` regex over `companyName`; `industry` regex over `industry`.
- Sorting: `createdAt: -1`.
- Pagination: `page` default 1, `limit` default 10, both coerced to minimum 1.

### Saved Jobs, Applications, Notifications

- Saved jobs: newest `savedAt` first.
- My applications: `createdAt: -1`.
- Applicants for job: `createdAt: -1`.
- Notifications: `createdAt: -1`.
- No pagination implemented for these routes.

## Validation Rules

- Email format and normalization for auth registration/login and company contact email.
- Password minimum length 6 for local registration.
- Duplicate email prevented across `User` and `Recruiter` during registration.
- Google-only users without password cannot use local login.
- ObjectId validation for route params and application `jobId` body where validators exist.
- Job enum validation for employment type and experience level.
- Application status enum validation.
- Company founded year must be integer between 1700 and current server year when provided.
- URL validation for recruiter `profilePicture` on registration and company `website`.
- Array validation for `skills` on job create/update.
- ISO8601 date validation for profile education, experience, certifications, and projects route bodies.
- Boolean validation for profile experience `current`.
- Duplicate job applications prevented by controller check and unique compound index.
- Duplicate saved jobs prevented by controller check.
- Cannot apply to closed jobs.
- Recruiter must be associated with a company to create/manage jobs and view/update applicants.
- Recruiter can create only one company through `POST /api/companies`.

Validation error shape from `express-validator`:

```json
{
  "errors": [
    {
      "type": "field",
      "value": "",
      "msg": "Job title is required",
      "path": "title",
      "location": "body"
    }
  ]
}
```

## Authorization Matrix

| Endpoint                                | Guest | Job Seeker | Recruiter              |
| --------------------------------------- | ----- | ---------- | ---------------------- |
| `GET /`                                 | Yes   | Yes        | Yes                    |
| `POST /api/auth/register/seeker`        | Yes   | Yes        | Yes                    |
| `POST /api/auth/register/recruiter`     | Yes   | Yes        | Yes                    |
| `POST /api/auth/login`                  | Yes   | Yes        | Yes                    |
| `POST /api/auth/logout`                 | Yes   | Yes        | Yes                    |
| `GET /api/auth/me`                      | No    | Yes        | Yes                    |
| `PUT /api/auth/profile`                 | No    | Yes        | No                     |
| `GET /api/auth/google`                  | Yes   | Yes        | Yes                    |
| `GET /api/auth/google/callback`         | OAuth | OAuth      | OAuth                  |
| `POST /api/companies`                   | No    | No         | Yes                    |
| `GET /api/companies`                    | Yes   | Yes        | Yes                    |
| `GET /api/companies/:id`                | Yes   | Yes        | Yes                    |
| `PUT /api/companies/:id`                | No    | No         | Yes, own company only  |
| `GET /api/companies/:id/jobs`           | Yes   | Yes        | Yes                    |
| `GET /api/jobs`                         | Yes   | Yes        | Yes                    |
| `GET /api/jobs/my-jobs`                 | No    | No         | Yes                    |
| `GET /api/jobs/:id`                     | Yes   | Yes        | Yes                    |
| `POST /api/jobs`                        | No    | No         | Yes, must have company |
| `PUT /api/jobs/:id`                     | No    | No         | Yes, same company      |
| `DELETE /api/jobs/:id`                  | No    | No         | Yes, same company      |
| `PUT /api/jobs/:id/close`               | No    | No         | Yes, same company      |
| `PUT /api/jobs/:id/reopen`              | No    | No         | Yes, same company      |
| `POST /api/applications`                | No    | Yes        | No                     |
| `GET /api/applications/my-applications` | No    | Yes        | No                     |
| `GET /api/applications/job/:jobId`      | No    | No         | Yes, same company      |
| `PUT /api/applications/:id/status`      | No    | No         | Yes, same company      |
| `GET /api/users/profile`                | No    | Yes        | No                     |
| `PUT /api/users/profile/*`              | No    | Yes        | No                     |
| `POST /api/users/profile/*`             | No    | Yes        | No                     |
| `DELETE /api/users/profile/*`           | No    | Yes        | No                     |
| `GET /api/users/saved-jobs`             | No    | Yes        | No                     |
| `POST /api/users/saved-jobs/:jobId`     | No    | Yes        | No                     |
| `DELETE /api/users/saved-jobs/:jobId`   | No    | Yes        | No                     |
| `GET /api/users/dashboard`              | No    | Yes        | No                     |
| `GET /api/notifications`                | No    | Yes        | Yes                    |
| `PUT /api/notifications/:id/read`       | No    | Own only   | Own only               |
| `DELETE /api/notifications/:id`         | No    | Own only   | Own only               |
| `GET /api/dashboard/user`               | No    | Yes        | No                     |
| `GET /api/dashboard/recruiter`          | No    | No         | Yes                    |

## Error Responses

Actual code returns these representative error shapes:

### 400 Bad Request

Validation:

```json
{ "errors": [] }
```

Business rule:

```json
{
  "message": "Recruiter must be associated with a company to list a job. Please register or create a company profile first."
}
```

Other implemented 400 messages include:

- `User already exists with this email`
- `This email is linked with Google OAuth. Please login with Google.`
- `Recruiter is already associated with a company`
- `Invalid company ID format`
- `Recruiter is not associated with any company`
- `Invalid job ID format`
- `Cannot apply to a closed job listing`
- `You have already applied for this job`
- `Invalid application ID format`
- `Job already saved`

### 401 Unauthorized

```json
{ "message": "Not authorized, no token provided" }
```

```json
{ "message": "Not authorized, user not found" }
```

```json
{ "message": "Not authorized, token validation failed" }
```

```json
{ "message": "Invalid email or password" }
```

### 403 Forbidden

```json
{
  "message": "Forbidden: Account type 'seeker' is not authorized to access this resource"
}
```

```json
{
  "message": "Forbidden: You do not have permissions to modify jobs belonging to other companies"
}
```

### 404 Not Found

Resource:

```json
{ "message": "Job not found" }
```

Global not found middleware:

```json
{
  "message": "Not Found - /api/missing",
  "stack": "hidden only when NODE_ENV=production"
}
```

### 409 Conflict

No controller explicitly returns HTTP 409. Duplicate email, duplicate saved job, and duplicate application currently return 400.

### 500 Internal Server Error

Global error handler:

```json
{
  "message": "Error message",
  "stack": "hidden only when NODE_ENV=production"
}
```

## Frontend Data Flow

### Guest

```text
Landing
  -> GET /api/jobs
  -> GET /api/companies
Job Details
  -> GET /api/jobs/:id
Login
  -> POST /api/auth/login
Dashboard Redirect
  -> GET /api/auth/me
Logout
  -> POST /api/auth/logout
```

### Job Seeker

```text
Register
  -> POST /api/auth/register/seeker
Complete Profile
  -> PUT /api/users/profile/headline
  -> PUT /api/users/profile/about
  -> POST/PUT/DELETE /api/users/profile/{education|experience|certifications|projects|skills|languages}
Browse Jobs
  -> GET /api/jobs
Search
  -> GET /api/jobs?search=&location=&category=&employmentType=&page=&limit=
View Job
  -> GET /api/jobs/:id
Save Job
  -> POST /api/users/saved-jobs/:jobId
Apply
  -> POST /api/applications
Track Application
  -> GET /api/applications/my-applications
Dashboard
  -> GET /api/dashboard/user
Notifications
  -> GET /api/notifications
```

### Recruiter

```text
Register/Login
  -> POST /api/auth/register/recruiter or POST /api/auth/login
Create Company
  -> POST /api/companies
Create Job
  -> POST /api/jobs
Manage Jobs
  -> GET /api/jobs/my-jobs
  -> PUT /api/jobs/:id
  -> PUT /api/jobs/:id/close
  -> PUT /api/jobs/:id/reopen
Manage Applicants
  -> GET /api/applications/job/:jobId
Update Status
  -> PUT /api/applications/:id/status
Dashboard
  -> GET /api/dashboard/recruiter
Notifications
  -> GET /api/notifications
```

## Route Map

| Method | Endpoint                                | Authentication | Role             | Controller                                   | Purpose                    |
| ------ | --------------------------------------- | -------------- | ---------------- | -------------------------------------------- | -------------------------- |
| GET    | `/`                                     | No             | Any              | inline in `app.js`                           | Root API message           |
| POST   | `/api/auth/register/seeker`             | No             | Any              | `registerSeeker`                             | Register job seeker        |
| POST   | `/api/auth/register/recruiter`          | No             | Any              | `registerRecruiter`                          | Register recruiter         |
| POST   | `/api/auth/login`                       | No             | Any              | `login`                                      | Login seeker/recruiter     |
| POST   | `/api/auth/logout`                      | No             | Any              | `logout`                                     | Clear auth cookie          |
| GET    | `/api/auth/me`                          | Yes            | Seeker/Recruiter | `getMe`                                      | Current account            |
| PUT    | `/api/auth/profile`                     | Yes            | Seeker           | `updateProfile`                              | Bulk seeker profile update |
| GET    | `/api/auth/google`                      | No             | Any              | Passport                                     | Start Google OAuth         |
| GET    | `/api/auth/google/callback`             | OAuth          | Seeker           | inline in `authRoutes.js`                    | Complete Google OAuth      |
| POST   | `/api/companies`                        | Yes            | Recruiter        | `createCompany`                              | Create company             |
| GET    | `/api/companies`                        | No             | Any              | `listCompanies`                              | List companies             |
| GET    | `/api/companies/:id`                    | No             | Any              | `getCompany`                                 | Company detail             |
| PUT    | `/api/companies/:id`                    | Yes            | Recruiter        | `updateCompany`                              | Update own company         |
| GET    | `/api/companies/:id/jobs`               | No             | Any              | `getCompanyJobs`                             | Open jobs for company      |
| GET    | `/api/jobs`                             | No             | Any              | `getJobs`                                    | Search/list open jobs      |
| GET    | `/api/jobs/my-jobs`                     | Yes            | Recruiter        | `getRecruiterJobs`                           | Recruiter's jobs           |
| GET    | `/api/jobs/:id`                         | No             | Any              | `getJobById`                                 | Job detail                 |
| POST   | `/api/jobs`                             | Yes            | Recruiter        | `createJob`                                  | Create job                 |
| PUT    | `/api/jobs/:id`                         | Yes            | Recruiter        | `editJob`                                    | Edit job                   |
| DELETE | `/api/jobs/:id`                         | Yes            | Recruiter        | `deleteJob`                                  | Delete job                 |
| PUT    | `/api/jobs/:id/close`                   | Yes            | Recruiter        | `closeJob`                                   | Close job                  |
| PUT    | `/api/jobs/:id/reopen`                  | Yes            | Recruiter        | `reopenJob`                                  | Reopen job                 |
| POST   | `/api/applications`                     | Yes            | Seeker           | `applyToJob`                                 | Apply to job               |
| GET    | `/api/applications/my-applications`     | Yes            | Seeker           | `getMyApplications`                          | Seeker applications        |
| GET    | `/api/applications/job/:jobId`          | Yes            | Recruiter        | `getApplicantsForJob`                        | Job applicants             |
| PUT    | `/api/applications/:id/status`          | Yes            | Recruiter        | `updateApplicationStatus`                    | Update application status  |
| GET    | `/api/users/profile`                    | Yes            | Seeker           | `getProfile`                                 | Full seeker profile        |
| PUT    | `/api/users/profile/headline`           | Yes            | Seeker           | `updateHeadline`                             | Update headline            |
| PUT    | `/api/users/profile/about`              | Yes            | Seeker           | `updateAbout`                                | Update about               |
| PUT    | `/api/users/profile/location`           | Yes            | Seeker           | `updateLocation`                             | Update location            |
| PUT    | `/api/users/profile/resume`             | Yes            | Seeker           | `updateResume`                               | Update resume              |
| PUT    | `/api/users/profile/picture`            | Yes            | Seeker           | `updateProfilePicture`                       | Update profile picture     |
| PUT    | `/api/users/profile/preferences`        | Yes            | Seeker           | `updatePreferences`                          | Update preferences         |
| PUT    | `/api/users/profile/social-links`       | Yes            | Seeker           | `updateSocialLinks`                          | Update social links        |
| POST   | `/api/users/profile/education`          | Yes            | Seeker           | `addEducation`                               | Add education              |
| PUT    | `/api/users/profile/education/:id`      | Yes            | Seeker           | `updateEducation`                            | Update education           |
| DELETE | `/api/users/profile/education/:id`      | Yes            | Seeker           | `deleteEducation`                            | Delete education           |
| POST   | `/api/users/profile/experience`         | Yes            | Seeker           | `addExperience`                              | Add experience             |
| PUT    | `/api/users/profile/experience/:id`     | Yes            | Seeker           | `updateExperience`                           | Update experience          |
| DELETE | `/api/users/profile/experience/:id`     | Yes            | Seeker           | `deleteExperience`                           | Delete experience          |
| POST   | `/api/users/profile/certifications`     | Yes            | Seeker           | `addCertification`                           | Add certification          |
| PUT    | `/api/users/profile/certifications/:id` | Yes            | Seeker           | `updateCertification`                        | Update certification       |
| DELETE | `/api/users/profile/certifications/:id` | Yes            | Seeker           | `deleteCertification`                        | Delete certification       |
| POST   | `/api/users/profile/projects`           | Yes            | Seeker           | `addProject`                                 | Add project                |
| PUT    | `/api/users/profile/projects/:id`       | Yes            | Seeker           | `updateProject`                              | Update project             |
| DELETE | `/api/users/profile/projects/:id`       | Yes            | Seeker           | `deleteProject`                              | Delete project             |
| POST   | `/api/users/profile/skills`             | Yes            | Seeker           | `addSkill`                                   | Add skill                  |
| PUT    | `/api/users/profile/skills/:id`         | Yes            | Seeker           | `updateSkill`                                | Update skill               |
| DELETE | `/api/users/profile/skills/:id`         | Yes            | Seeker           | `deleteSkill`                                | Delete skill               |
| POST   | `/api/users/profile/languages`          | Yes            | Seeker           | `addLanguage`                                | Add language               |
| PUT    | `/api/users/profile/languages/:id`      | Yes            | Seeker           | `updateLanguage`                             | Update language            |
| DELETE | `/api/users/profile/languages/:id`      | Yes            | Seeker           | `deleteLanguage`                             | Delete language            |
| GET    | `/api/users/saved-jobs`                 | Yes            | Seeker           | `getSavedJobs`                               | List saved jobs            |
| POST   | `/api/users/saved-jobs/:jobId`          | Yes            | Seeker           | `saveJob`                                    | Save job                   |
| DELETE | `/api/users/saved-jobs/:jobId`          | Yes            | Seeker           | `removeSavedJob`                             | Remove saved job           |
| GET    | `/api/users/dashboard`                  | Yes            | Seeker           | `getUserDashboard`                           | Seeker dashboard           |
| GET    | `/api/notifications`                    | Yes            | Seeker/Recruiter | `getNotifications`                           | List notifications         |
| PUT    | `/api/notifications/:id/read`           | Yes            | Seeker/Recruiter | `markNotificationAsRead`                     | Mark notification read     |
| DELETE | `/api/notifications/:id`                | Yes            | Seeker/Recruiter | `deleteNotification`                         | Delete notification        |
| GET    | `/api/dashboard/user`                   | Yes            | Seeker           | `getUserDashboard` from dashboard controller | Seeker dashboard           |
| GET    | `/api/dashboard/recruiter`              | Yes            | Recruiter        | `getRecruiterDashboard`                      | Recruiter dashboard        |

## API Index

### Authentication

- `POST /api/auth/register/seeker`
- `POST /api/auth/register/recruiter`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `PUT /api/auth/profile`
- `GET /api/auth/google`
- `GET /api/auth/google/callback`

### Companies

- `POST /api/companies`
- `GET /api/companies`
- `GET /api/companies/:id`
- `PUT /api/companies/:id`
- `GET /api/companies/:id/jobs`

### Jobs

- `GET /api/jobs`
- `GET /api/jobs/my-jobs`
- `GET /api/jobs/:id`
- `POST /api/jobs`
- `PUT /api/jobs/:id`
- `DELETE /api/jobs/:id`
- `PUT /api/jobs/:id/close`
- `PUT /api/jobs/:id/reopen`

### Applications

- `POST /api/applications`
- `GET /api/applications/my-applications`
- `GET /api/applications/job/:jobId`
- `PUT /api/applications/:id/status`

### Users, Profile, Saved Jobs

- `GET /api/users/profile`
- `PUT /api/users/profile/headline`
- `PUT /api/users/profile/about`
- `PUT /api/users/profile/location`
- `PUT /api/users/profile/resume`
- `PUT /api/users/profile/picture`
- `PUT /api/users/profile/preferences`
- `PUT /api/users/profile/social-links`
- `POST /api/users/profile/education`
- `PUT /api/users/profile/education/:id`
- `DELETE /api/users/profile/education/:id`
- `POST /api/users/profile/experience`
- `PUT /api/users/profile/experience/:id`
- `DELETE /api/users/profile/experience/:id`
- `POST /api/users/profile/certifications`
- `PUT /api/users/profile/certifications/:id`
- `DELETE /api/users/profile/certifications/:id`
- `POST /api/users/profile/projects`
- `PUT /api/users/profile/projects/:id`
- `DELETE /api/users/profile/projects/:id`
- `POST /api/users/profile/skills`
- `PUT /api/users/profile/skills/:id`
- `DELETE /api/users/profile/skills/:id`
- `POST /api/users/profile/languages`
- `PUT /api/users/profile/languages/:id`
- `DELETE /api/users/profile/languages/:id`
- `GET /api/users/saved-jobs`
- `POST /api/users/saved-jobs/:jobId`
- `DELETE /api/users/saved-jobs/:jobId`
- `GET /api/users/dashboard`

### Notifications

- `GET /api/notifications`
- `PUT /api/notifications/:id/read`
- `DELETE /api/notifications/:id`

### Dashboard

- `GET /api/dashboard/user`
- `GET /api/dashboard/recruiter`

## Quality Check

Manual verification performed against:

- `server/app.js` for mounted base routes.
- `server/routes/*.js` for methods, paths, route order, auth middleware, and validation chains.
- `server/controllers/*.js` for controller response shapes, status codes, side effects, ownership checks, sorting, pagination, and error messages.
- `server/models/*.js` for collection models, schema fields, defaults, enums, references, timestamps, indexes, and subdocuments.
- `server/middleware/*.js` and `server/utils/generateToken.js` for auth behavior and error shapes.
- Integration tests under `server/tests/` for expected route behavior.

Known implementation notes for frontend:

- `server/backend_api.md` exists but is not used by this root reference.
- No backend route returns HTTP 409.
- Closed jobs are excluded from `GET /api/jobs` but can still be fetched by `GET /api/jobs/:id`.
- Job deletion does not cascade to applications.
- Notification writes during application creation/status update are best-effort and failures are swallowed outside production with a warning.
- The recruiter registration `company` field can set a company reference but does not update the company recruiters array.
- `/api/users/dashboard` and `/api/dashboard/user` both exist for seeker dashboard data.
