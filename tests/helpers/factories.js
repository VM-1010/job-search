import User from '../../models/userModel.js';
import Recruiter from '../../models/recruiterModel.js';
import Company from '../../models/companyModel.js';
import Job from '../../models/jobModel.js';
import Application from '../../models/applicationModel.js';
import Notification from '../../models/notificationModel.js';

let emailCounter = 0;
const getUniqueEmail = (prefix) => `${prefix}_${Date.now()}_${emailCounter++}@test.com`;

export const createSeeker = async (overrides = {}) => {
  const defaultData = {
    name: 'Test Seeker',
    email: getUniqueEmail('seeker'),
    password: 'password123',
    profile: {
      headline: 'Software Engineer',
      about: 'Passionate developer.',
      location: 'New York, NY',
      education: [],
      experience: [],
      certifications: [],
      projects: [],
      skills: [],
      languages: [],
      socialLinks: {
        github: '',
        linkedin: '',
        twitter: '',
        website: ''
      },
      preferences: {
        jobTypes: ['Full-time'],
        locations: ['New York, NY'],
        industries: ['Tech']
      }
    }
  };
  
  const merged = {
    ...defaultData,
    ...overrides,
    profile: {
      ...defaultData.profile,
      ...(overrides.profile || {})
    }
  };
  
  return await User.create(merged);
};

export const createRecruiter = async (overrides = {}) => {
  const defaultData = {
    recruiterName: 'Test Recruiter',
    email: getUniqueEmail('recruiter'),
    password: 'password123',
    company: null,
    title: 'HR Manager',
    profilePicture: ''
  };
  return await Recruiter.create({ ...defaultData, ...overrides });
};

export const createCompany = async (overrides = {}) => {
  const defaultData = {
    companyName: 'Test Tech Corp',
    website: 'https://testtechcorp.example.com',
    contactEmail: 'contact@testtechcorp.example.com',
    industry: 'Technology',
    headquarters: 'San Francisco, CA',
    foundedYear: 2020,
    companySize: '51-200',
    recruiters: []
  };
  return await Company.create({ ...defaultData, ...overrides });
};

export const createJob = async (overrides = {}) => {
  const defaultData = {
    title: 'Senior Developer',
    description: 'Looking for a senior developer.',
    requirements: '5+ years experience.',
    responsibilities: 'Build awesome code.',
    skills: ['Node.js', 'React', 'MongoDB'],
    employmentType: 'Full-time',
    experienceLevel: 'Senior Level',
    location: 'Remote',
    category: 'Engineering',
    status: 'Open'
  };
  
  if (!overrides.company || !overrides.recruiter) {
    throw new Error('company and recruiter references are required to create a job');
  }
  
  return await Job.create({ ...defaultData, ...overrides });
};

export const createApplication = async (overrides = {}) => {
  if (!overrides.applicant || !overrides.recruiter || !overrides.company || !overrides.job) {
    throw new Error('applicant, recruiter, company, and job references are required to create an application');
  }
  
  let profileSnapshot = overrides.profileSnapshot;
  if (!profileSnapshot) {
    const seeker = await User.findById(overrides.applicant);
    profileSnapshot = {
      name: seeker.name,
      headline: seeker.profile.headline || '',
      location: seeker.profile.location || '',
      resume: seeker.profile.resume || '',
      education: seeker.profile.education || [],
      experience: seeker.profile.experience || [],
      certifications: seeker.profile.certifications || [],
      projects: seeker.profile.projects || [],
      skills: seeker.profile.skills || []
    };
  }
  
  const defaultData = {
    coverLetter: 'I am excited to apply.',
    status: 'Applied',
    profileSnapshot
  };
  
  return await Application.create({ ...defaultData, ...overrides });
};

export const createNotification = async (overrides = {}) => {
  if (!overrides.recipient) {
    throw new Error('recipient reference is required to create a notification');
  }
  
  const defaultData = {
    title: 'New Update',
    message: 'Something happened.',
    type: 'general',
    read: false
  };
  
  return await Notification.create({ ...defaultData, ...overrides });
};
