import User from "./models/userModel.js";
import Recruiter from "./models/recruiterModel.js";
import Company from "./models/companyModel.js";
import Job from "./models/jobModel.js";
import Application from "./models/applicationModel.js";
import { createCompany } from "./controllers/companyController.js";
import { createJob } from "./controllers/jobController.js";
import { applyToJob } from "./controllers/applicationController.js";

// Simple assertions helper
function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
  console.log(`[PASS] ${message}`);
}

async function runTests() {
  console.log("Starting Companies, Jobs, and Applications unit tests...");

  // Mock data store
  let db = {
    users: [],
    recruiters: [],
    companies: [],
    jobs: [],
    applications: [],
  };

  // Setup mock functions
  User.findById = async (id) =>
    db.users.find((u) => u._id.toString() === id.toString()) || null;
  Recruiter.findById = async (id) =>
    db.recruiters.find((r) => r._id.toString() === id.toString()) || null;
  Company.findById = async (id) =>
    db.companies.find((c) => c._id.toString() === id.toString()) || null;
  Company.find = async () => db.companies;
  Job.findById = async (id) =>
    db.jobs.find((j) => j._id.toString() === id.toString()) || null;
  Job.find = async (q) => {
    if (q && q.recruiter) {
      return db.jobs.filter(
        (j) => j.recruiter.toString() === q.recruiter.toString(),
      );
    }
    return db.jobs;
  };
  Application.findOne = async (q) =>
    db.applications.find(
      (a) =>
        a.applicant.toString() === q.applicant.toString() &&
        a.job.toString() === q.job.toString(),
    ) || null;

  Company.create = async (data) => {
    const c = {
      _id: "company_id_123",
      ...data,
      save: async function () {
        return this;
      },
    };
    db.companies.push(c);
    return c;
  };

  Job.create = async (data) => {
    const j = {
      _id: "job_id_456",
      ...data,
      save: async function () {
        return this;
      },
    };
    db.jobs.push(j);
    return j;
  };

  Application.create = async (data) => {
    const a = {
      _id: "app_id_789",
      ...data,
      save: async function () {
        return this;
      },
    };
    db.applications.push(a);
    return a;
  };

  // Seed user and recruiter
  const mockSeeker = {
    _id: "seeker_id_999",
    name: "John Seeker",
    email: "john@seeker.com",
    profile: {
      headline: "Full Stack Engineer",
      location: "New York",
      resume: "resume_v1.pdf",
      skills: [{ name: "React" }, { name: "Node" }],
      education: [{ school: "NYU", degree: "BSCS" }],
      experience: [{ company: "Google", position: "Intern" }],
    },
  };
  db.users.push(mockSeeker);

  const mockRecruiter = {
    _id: "recruiter_id_888",
    recruiterName: "Alice Recruiter",
    email: "alice@recruiter.com",
    company: null,
    save: async function () {
      return this;
    },
  };
  db.recruiters.push(mockRecruiter);

  // Test 1: Create Company
  {
    const req = {
      user: { _id: "recruiter_id_888" },
      body: {
        companyName: "TechCorp",
        website: "https://techcorp.com",
        contactEmail: "info@techcorp.com",
      },
    };
    let jsonResponse = null;
    let statusCode = 200;
    const res = {
      status: (code) => {
        statusCode = code;
        return res;
      },
      json: (data) => {
        jsonResponse = data;
        return res;
      },
    };

    await createCompany(req, res, (err) => console.error(err));
    assert(statusCode === 201, "Should return status 201 on company creation");
    assert(db.companies.length === 1, "Company should be added to db");
    assert(
      mockRecruiter.company !== null,
      "Recruiter company reference should be updated",
    );
    assert(
      db.companies[0].companyName === "TechCorp",
      "Company name should match input",
    );
  }

  // Test 2: Create Job
  {
    const req = {
      user: { _id: "recruiter_id_888" },
      body: {
        title: "Senior Node Developer",
        description: "Excellent Node position",
        requirements: "Node experience",
        responsibilities: "Build APIs",
        employmentType: "Full-time",
        experienceLevel: "Senior Level",
        location: "Remote",
        category: "Engineering",
        skills: ["Node.js", "Express"],
      },
    };
    let jsonResponse = null;
    let statusCode = 200;
    const res = {
      status: (code) => {
        statusCode = code;
        return res;
      },
      json: (data) => {
        jsonResponse = data;
        return res;
      },
    };

    await createJob(req, res, (err) => console.error(err));
    assert(statusCode === 201, "Should return status 201 on job creation");
    assert(db.jobs.length === 1, "Job should be added to db");
    assert(
      db.jobs[0].company.toString() === mockRecruiter.company.toString(),
      "Job should point to recruiter company",
    );
  }

  // Test 3: Apply to Job and Profile Snapshot
  {
    const req = {
      user: { _id: "seeker_id_999" },
      body: {
        jobId: "job_id_456",
        coverLetter: "I am a great developer!",
      },
    };
    let jsonResponse = null;
    let statusCode = 200;
    const res = {
      status: (code) => {
        statusCode = code;
        return res;
      },
      json: (data) => {
        jsonResponse = data;
        return res;
      },
    };

    await applyToJob(req, res, (err) => console.error(err));
    assert(statusCode === 201, "Should return status 201 on job application");
    assert(db.applications.length === 1, "Application should be added to db");

    // Check profile snapshot integrity
    const snapshot = db.applications[0].profileSnapshot;
    assert(
      snapshot.name === "John Seeker",
      "Snapshot should contain seeker name",
    );
    assert(
      snapshot.headline === "Full Stack Engineer",
      "Snapshot should contain seeker headline",
    );
    assert(
      snapshot.skills[0].name === "React",
      "Snapshot should contain seeker skills",
    );

    // Simulate seeker updating profile later
    mockSeeker.profile.headline = "Principal Developer";
    mockSeeker.profile.skills.push({ name: "GraphQL" });

    // Snapshot in application should NOT change!
    assert(
      snapshot.headline === "Full Stack Engineer",
      "Snapshot headline should remain unchanged after profile update",
    );
    assert(
      snapshot.skills.length === 2,
      "Snapshot skills array length should remain unchanged after profile update",
    );
  }

  // Test 4: Prevent duplicate applications
  {
    const req = {
      user: { _id: "seeker_id_999" },
      body: {
        jobId: "job_id_456",
        coverLetter: "Attempting duplicate application",
      },
    };
    let jsonResponse = null;
    let statusCode = 200;
    const res = {
      status: (code) => {
        statusCode = code;
        return res;
      },
      json: (data) => {
        jsonResponse = data;
        return res;
      },
    };

    await applyToJob(req, res, (err) => {});
    assert(statusCode === 400, "Should return 400 on duplicate application");
    assert(
      jsonResponse.message === "You have already applied for this job",
      "Duplicate application message matches",
    );
  }

  console.log(
    "All Companies, Jobs, and Applications tests passed successfully!",
  );
}

runTests().catch((err) => {
  console.error("Test Suite Failed:", err);
  process.exit(1);
});
