# JobSphere Backend

A RESTful backend for **JobSphere**, a MERN-based job portal that connects job seekers, recruiters, and companies. The backend provides secure authentication, profile management, company management, job listings, job applications, notifications, and dashboard APIs.

> Built with Node.js, Express.js, MongoDB, and Mongoose as the backend component of a full-stack MERN project.

---

# Features

## Authentication

- JWT Authentication
- Password hashing with bcrypt
- Role-based authorization
- Job Seeker registration and login
- Recruiter registration and login
- Google OAuth support (Job Seekers)

---

## User Profiles

Users can manage:

- Professional headline
- About section
- Location
- Resume
- Education
- Experience
- Certifications
- Projects
- Skills
- Languages
- Job preferences
- Social links

---

## Company Management

Recruiters can:

- Create companies
- Update company profiles
- View company information
- Manage recruiters within a company
- View company job listings

---

## Job Management

Recruiters can:

- Create jobs
- Edit jobs
- Delete jobs
- Close jobs
- Reopen jobs

Job seekers can:

- Browse jobs
- Search jobs
- Filter jobs
- View job details

---

## Applications

- Apply for jobs
- Prevent duplicate applications
- Immutable applicant profile snapshots
- Recruiter applicant management
- Application status tracking

Status values:

- Applied
- Under Review
- Shortlisted
- Interview
- Rejected
- Accepted

---

## Saved Jobs

- Save jobs
- Remove saved jobs
- View saved jobs

---

## Notifications

- Application notifications
- Status update notifications
- Read/Delete notifications

---

## Dashboard APIs

### Job Seeker Dashboard

- Recent applications
- Saved jobs
- Application statistics
- Profile completion

### Recruiter Dashboard

- Job statistics
- Applicant counts
- Recent applications

---

# Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- Passport.js
- bcrypt
- express-validator

---

# Project Structure

```text
server/
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── services/
├── utils/
├── uploads/
├── tests/
├── app.js
├── server.js
└── package.json
```

---

# API Modules

- Authentication
- User Profiles
- Recruiters
- Companies
- Jobs
- Applications
- Saved Jobs
- Notifications
- Dashboards

Detailed documentation is available in:

```text
BACKEND_API.md
```

---

# Testing

The backend includes automated integration tests covering:

- Authentication
- Authorization
- User Profiles
- Companies
- Jobs
- Applications
- Saved Jobs
- Notifications
- Dashboard APIs
- Validation
- Database Integrity
- Error Handling
- Performance

**Current Status**

- Test Suites: **13/13 Passed**
- Tests: **72/72 Passed**

---

# Installation

## Clone

```bash
git clone <repository-url>
cd JobSphere/server
```

## Install Dependencies

```bash
npm install
```

## Configure Environment

Create a `.env` file:

```env
PORT=5000
MONGO_URI=<your_mongodb_connection_string>
JWT_SECRET=<your_jwt_secret>
GOOGLE_CLIENT_ID=<your_google_client_id>
GOOGLE_CLIENT_SECRET=<your_google_client_secret>
CLIENT_URL=http://localhost:5173
```

## Start Development Server

```bash
npm run dev
```

---

# Roadmap

The backend is complete and tested.

The React frontend lives in `client/` and consumes the REST API provided by this backend.

### Frontend Quick Start

```bash
cd client
npm install
npm run dev
```

See `client/README.md` for full frontend documentation.

---

# License

This project was developed as part of a MERN Stack course for educational purposes.
