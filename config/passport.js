import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/userModel.js";

const configurePassport = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID || "dummy_id",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || "dummy_secret",
        callbackURL: "/api/auth/google/callback",
        proxy: true,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists by googleId
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            return done(null, user);
          }

          // Check if user already exists by email
          const email =
            profile.emails && profile.emails[0]
              ? profile.emails[0].value
              : null;
          if (email) {
            user = await User.findOne({ email: email.toLowerCase() });
            if (user) {
              // Link Google account to existing user
              user.googleId = profile.id;
              if (
                !user.profile.profilePhoto &&
                profile.photos &&
                profile.photos[0]
              ) {
                user.profile.profilePhoto = profile.photos[0].value;
              }
              await user.save();
              return done(null, user);
            }
          }

          // Create a new Job Seeker with default empty profile
          const name = profile.displayName || "Google User";
          user = await User.create({
            name,
            email: email
              ? email.toLowerCase()
              : `${profile.id}@google-oauth.com`,
            googleId: profile.id,
            profile: {
              headline: "",
              about: "",
              location: "",
              profilePhoto:
                profile.photos && profile.photos[0]
                  ? profile.photos[0].value
                  : "",
              education: [],
              experience: [],
              certifications: [],
              projects: [],
              skills: [],
              languages: [],
              socialLinks: {
                github: "",
                linkedin: "",
                twitter: "",
                website: "",
              },
              resume: "",
              preferences: { jobTypes: [], locations: [], industries: [] },
            },
          });

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      },
    ),
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};

export default configurePassport;
