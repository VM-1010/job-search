import { validationResult } from "express-validator";
import Application from "../models/applicationModel.js";
import Job from "../models/jobModel.js";
import Recruiter from "../models/recruiterModel.js";
import User from "../models/userModel.js";

// @desc    Apply to a job
// @route   POST /api/applications
// @access  Private (Job Seeker only)
export const applyToJob = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { jobId, coverLetter } = req.body;

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.status === "Closed") {
      return res
        .status(400)
        .json({ message: "Cannot apply to a closed job listing" });
    }

    // Prevent duplicate applications
    const duplicate = await Application.findOne({
      applicant: req.user._id,
      job: jobId,
    });

    if (duplicate) {
      return res
        .status(400)
        .json({ message: "You have already applied for this job" });
    }

    // Retrieve full user profile to build the snapshot
    const user = await User.findById(req.user._id);

    // Create the profile snapshot at the time of application
    const profileSnapshot = structuredClone({
      name: user.name,
      headline: user.profile.headline || "",
      location: user.profile.location || "",
      resume: user.profile.resume || "",
      education: user.profile.education || [],
      experience: user.profile.experience || [],
      certifications: user.profile.certifications || [],
      projects: user.profile.projects || [],
      skills: user.profile.skills || [],
    });

    const application = await Application.create({
      applicant: req.user._id,
      recruiter: job.recruiter,
      company: job.company,
      job: jobId,
      coverLetter: coverLetter || "",
      status: "Applied",
      profileSnapshot,
    });

    res.status(201).json({
      message: "Application submitted successfully",
      application,
    });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid job ID format" });
    }
    next(error);
  }
};

// @desc    Get current job seeker's applications
// @route   GET /api/applications/my-applications
// @access  Private (Job Seeker only)
export const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate(
        "job",
        "title location category employmentType experienceLevel salaryRange status",
      )
      .populate("company", "companyName logo industry headquarters")
      .populate("recruiter", "recruiterName email title")
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    next(error);
  }
};

// @desc    Get applicants for a specific job
// @route   GET /api/applications/job/:jobId
// @access  Private (Recruiter of that company only)
export const getApplicantsForJob = async (req, res, next) => {
  try {
    const recruiter = await Recruiter.findById(req.user._id);
    if (!recruiter.company) {
      return res
        .status(400)
        .json({ message: "Recruiter is not associated with any company" });
    }

    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Verify job belongs to recruiter's company
    if (job.company.toString() !== recruiter.company.toString()) {
      return res.status(403).json({
        message:
          "Forbidden: You do not have permissions to view applicants for this job",
      });
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate("applicant", "name email")
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid job ID format" });
    }
    next(error);
  }
};

// @desc    Update application status
// @route   PUT /api/applications/:id/status
// @access  Private (Recruiter of that company only)
export const updateApplicationStatus = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status } = req.body;

    const application = await Application.findById(req.params.id).populate(
      "job",
    );
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    const recruiter = await Recruiter.findById(req.user._id);
    if (!recruiter.company) {
      return res
        .status(400)
        .json({ message: "Recruiter is not associated with any company" });
    }

    // Verify application job belongs to recruiter's company
    if (application.job.company.toString() !== recruiter.company.toString()) {
      return res.status(403).json({
        message:
          "Forbidden: You do not have permissions to update this application",
      });
    }

    application.status = status;
    await application.save();

    res.json({
      message: `Application status updated to ${status} successfully`,
      application,
    });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid application ID format" });
    }
    next(error);
  }
};
