> backend@1.0.0 test
> node --experimental-vm-modules node_modules/jest/bin/jest.js --runInBand

PASS tests/auth.test.js
Authentication API Integration Tests
Job Seeker Authentication
√ Register seeker successfully (107 ms)
√ Reject duplicate email registration (56 ms)
√ Reject invalid email address structure (7 ms)
√ Reject weak password (< 6 characters) (5 ms)
√ Login seeker successfully (100 ms)
√ Reject invalid password on seeker login (98 ms)
√ Access seeker protected route with Bearer JWT token (105 ms)
√ Reject seeker protected route without token (5 ms)
√ Logout successfully sets cookie expiration in response headers (5 ms)
Recruiter Authentication
√ Register recruiter successfully (54 ms)
√ Reject duplicate recruiter email registration (54 ms)
√ Login recruiter successfully (100 ms)
√ Access recruiter protected routes with token (104 ms)

PASS tests/authorization.test.js
Authorization Integration Tests
√ Unauthenticated requests return 401 Unauthorized (117 ms)
√ Job Seeker cannot create company (403 Forbidden) (113 ms)
√ Job Seeker cannot create job (403 Forbidden) (102 ms)
√ Job Seeker cannot access recruiter dashboard (403 Forbidden) (102 ms)
√ Recruiter cannot access seeker dashboard (403 Forbidden) (102 ms)
√ Recruiter cannot modify another company (403 Forbidden) (107 ms)
√ Recruiter cannot modify another company's job listing (403 Forbidden) (154 ms)

PASS tests/job.test.js
Job API Integration Tests
√ Create job listing successfully by associated recruiter (100 ms)
√ Reject job creation if recruiter is not linked to any company (102 ms)
√ Edit job details successfully by owner company recruiter (61 ms)
√ Reject editing job from different company recruiter (104 ms)
√ Close and reopen job successfully by company recruiter (64 ms)
√ Delete job listing successfully by owner recruiter (57 ms)
√ Retrieve job details by ID (60 ms)
√ List jobs with pagination, sorting, and specific query filters (73 ms)
√ Return 400 for invalid job ID formats (53 ms)

PASS tests/savedJobs.test.js
Saved Jobs API Integration Tests
√ Save job successfully and prevent duplicate entries (135 ms)
√ Remove saved job successfully (107 ms)
√ List saved jobs successfully, sorted newest-first (115 ms)
√ Block unauthorized saved job modification for recruiters (101 ms)

PASS tests/profile.test.js
User Profile API Integration Tests
√ Update profile headline, about, location, and resume successfully (100 ms)
√ Update profile preferences successfully (56 ms)
√ Education CRUD successfully (72 ms)
√ Experience CRUD successfully (69 ms)
√ Certifications CRUD successfully (65 ms)
√ Projects CRUD successfully (66 ms)
√ Skills and Languages CRUD (76 ms)

PASS tests/validation.test.js
Validation Tests
√ Missing required fields during company creation returns 400 (128 ms)
√ Invalid ObjectIds in URL parameters returns 400 (99 ms)
√ Invalid enums for employmentType during job creation returns 400 (104 ms)
√ Invalid enums for status updates on applications returns 400 (105 ms)

PASS tests/integrity.test.js
Database Integrity and Reference Tests
√ Verify cross-referencing between Company and Recruiter (99 ms)
√ Verify Job references both Recruiter and Company (54 ms)
√ Verify Application references User, Recruiter, Company, and Job (104 ms)
√ Verify Saved Jobs references Job inside User (101 ms)
√ Verify Notification references recipient ID (53 ms)

PASS tests/application.test.js
Application API Integration Tests
√ Apply to job, verify database references and profile snapshot immutability (143 ms)
√ Prevent duplicate applications for the same job by seeker (110 ms)
√ Retrieve logged-in job seeker own applications list (111 ms)
√ Recruiter views applicants for job and executes status transition workflow (142 ms)
√ Block unauthorized applicant access for seekers and unlinked recruiters (154 ms)

PASS tests/company.test.js
Company API Integration Tests
√ Create company and link recruiter successfully (84 ms)
√ Reject company creation if recruiter already has a company (53 ms)
√ Get company by valid ID with active recruiter and job counts (63 ms)
√ Update company details successfully by associated recruiter (59 ms)
√ Reject unauthorized company update by another recruiter not belonging to company (54 ms)
√ List companies with search and pagination support (14 ms)
√ Return 400 validation error for invalid company ID format in getCompany (5 ms)

PASS tests/performance.test.js
Performance Smoke Tests
√ Scale test: Create 100 jobs, verify fast pagination, searching, and dashboard times (170 ms)

PASS tests/dashboard.test.js
Dashboard API Integration Tests
√ Retrieve Seeker Dashboard metrics successfully (137 ms)
√ Retrieve Recruiter Dashboard metrics successfully (125 ms)

PASS tests/notification.test.js
Notification API Integration Tests
√ Notification created automatically on application and retrieved by recruiter (142 ms)
√ Notification created automatically on application status update and retrieved by seeker (116 ms)
√ Mark notification as read and delete notification successfully (111 ms)

PASS tests/error.test.js
Error Handling Integration Tests
√ Return 404 for non-existent route paths (26 ms)
√ Return 401 for requests missing JWT (13 ms)
√ Return 401 for requests with malformed JWT (15 ms)
√ Return 401 for requests with expired JWT (10 ms)
√ Handle database casting errors gracefully (6 ms)

Test Suites: 13 passed, 13 total
Tests: 72 passed, 72 total
Snapshots: 0 total
Time: 16.914 s, estimated 23 s
Ran all test suites.
