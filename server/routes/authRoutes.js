import express from "express";
import { body } from "express-validator";
import passport from "passport";
import {
  registerSeeker,
  registerRecruiter,
  login,
  logout,
  getMe,
  updateProfile,
} from "../controllers/authController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import generateToken from "../utils/generateToken.js";

const router = express.Router();

// Validation chains
const registerSeekerValidation = [
  body("name").notEmpty().withMessage("Name is required").trim(),
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

const registerRecruiterValidation = [
  body("recruiterName")
    .notEmpty()
    .withMessage("Recruiter name is required")
    .trim(),
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("title").optional().trim(),
  body("profilePicture")
    .optional()
    .isURL()
    .withMessage("Profile picture must be a valid URL"),
  body("company")
    .optional()
    .isMongoId()
    .withMessage("Company must be a valid ID"),
];

const loginValidation = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

// Local Auth routes
router.post("/register/seeker", registerSeekerValidation, registerSeeker);
router.post(
  "/register/recruiter",
  registerRecruiterValidation,
  registerRecruiter,
);
router.post("/login", loginValidation, login);
router.post("/logout", logout);

// Profile routes
router.get("/me", protect, getMe);
router.put("/profile", protect, authorize("seeker"), updateProfile);

// Google OAuth routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_URL || "http://localhost:5173"}/login`,
    session: false,
  }),
  (req, res) => {
    // Passport returns the authenticated user at req.user
    if (!req.user) {
      return res.status(401).json({ message: "Google Authentication failed" });
    }

    // Set cookie and get token
    const token = generateToken(res, req.user._id, "seeker");

    // Redirect to frontend client application with token in url query (or just let frontend read HTTP-only cookie)
    res.redirect(
      `${process.env.CLIENT_URL || "http://localhost:5173"}/auth-success?token=${token}`,
    );
  },
);

export default router;
