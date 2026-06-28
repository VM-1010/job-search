import mongoose from "mongoose";
import bcrypt from "bcrypt";

const EducationSchema = new mongoose.Schema({
  school: { type: String, default: "" },
  degree: { type: String, default: "" },
  fieldOfStudy: { type: String, default: "" },
  startDate: { type: Date },
  endDate: { type: Date },
  description: { type: String, default: "" },
});

const ExperienceSchema = new mongoose.Schema({
  company: { type: String, default: "" },
  position: { type: String, default: "" },
  location: { type: String, default: "" },
  startDate: { type: Date },
  endDate: { type: Date },
  current: { type: Boolean, default: false },
  description: { type: String, default: "" },
});

const CertificationSchema = new mongoose.Schema({
  name: { type: String, default: "" },
  issuer: { type: String, default: "" },
  issueDate: { type: Date },
  expirationDate: { type: Date },
  credentialId: { type: String, default: "" },
  credentialUrl: { type: String, default: "" },
});

const ProjectSchema = new mongoose.Schema({
  title: { type: String, default: "" },
  description: { type: String, default: "" },
  link: { type: String, default: "" },
  startDate: { type: Date },
  endDate: { type: Date },
});

const SkillSchema = new mongoose.Schema({
  name: { type: String, default: "" },
  level: { type: String, default: "" }, // e.g. Beginner, Intermediate, Expert
});

const LanguageSchema = new mongoose.Schema({
  language: { type: String, default: "" },
  proficiency: { type: String, default: "" }, // e.g. Native, Fluent, Conversational
});

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: function () {
        // Password is only required if googleId is not present
        return !this.googleId;
      },
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null/undefined values
    },
    profile: {
      headline: { type: String, default: "" },
      about: { type: String, default: "" },
      location: { type: String, default: "" },
      profilePhoto: { type: String, default: "" },
      education: [EducationSchema],
      experience: [ExperienceSchema],
      certifications: [CertificationSchema],
      projects: [ProjectSchema],
      skills: [SkillSchema],
      languages: [LanguageSchema],
      socialLinks: {
        github: { type: String, default: "" },
        linkedin: { type: String, default: "" },
        twitter: { type: String, default: "" },
        website: { type: String, default: "" },
      },
      resume: { type: String, default: "" },
      preferences: {
        jobTypes: { type: [String], default: [] },
        locations: { type: [String], default: [] },
        industries: { type: [String], default: [] },
      },
    },
  },
  {
    timestamps: true,
  },
);

// Hash the password before saving it
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
UserSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", UserSchema);

export default User;
