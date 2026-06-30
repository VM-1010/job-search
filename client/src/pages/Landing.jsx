import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  useAuth,
  useUser,
} from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { syncUser } from "@/api/api";
import { Briefcase, Building2, Loader2 } from "lucide-react";

// ─── Role Picker ──────────────────────────────────────────────────────────────
// Shown ONLY on the very first sign-in when no role exists in Clerk metadata.
function RolePicker() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function choose(role) {
    setLoading(true);
    setError("");
    try {
      await syncUser(getToken, role);
      // Persist role in Clerk's cloud metadata — survives across devices/browsers
      await user.update({ unsafeMetadata: { role } });
      navigate(role === "employer" ? "/emp/dashboard" : "/dashboard");
    } catch (e) {
      setError(e.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-4">
      <div className="animate-slide-up w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-[12px] bg-[var(--primary)] text-white text-lg font-bold">
            JS
          </div>
          <h1 className="text-xl font-bold text-[var(--text)]">
            Welcome to JobSphere
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            How will you use the platform?
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            disabled={loading}
            onClick={() => choose("user")}
            className="group flex flex-col items-center gap-3 rounded-[var(--radius)] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-sm)] transition-all duration-150 hover:border-[var(--primary)] hover:shadow-[var(--shadow)] disabled:opacity-50 cursor-pointer"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--primary-light)] text-[var(--primary)] transition-colors group-hover:bg-[var(--primary)] group-hover:text-white">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text)]">Job Seeker</p>
              <p className="mt-0.5 text-xs text-[var(--text-muted)]">Find opportunities</p>
            </div>
          </button>

          <button
            disabled={loading}
            onClick={() => choose("employer")}
            className="group flex flex-col items-center gap-3 rounded-[var(--radius)] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-sm)] transition-all duration-150 hover:border-[var(--primary)] hover:shadow-[var(--shadow)] disabled:opacity-50 cursor-pointer"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--primary-light)] text-[var(--primary)] transition-colors group-hover:bg-[var(--primary)] group-hover:text-white">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text)]">Employer</p>
              <p className="mt-0.5 text-xs text-[var(--text-muted)]">Hire talent</p>
            </div>
          </button>
        </div>

        {loading && (
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-[var(--text-muted)]">
            <Loader2 className="h-4 w-4 animate-spin" /> Setting up your account…
          </div>
        )}
        {error && (
          <p className="mt-4 text-center text-sm text-[var(--danger)]">{error}</p>
        )}
      </div>
    </div>
  );
}

// ─── Signed-in Handler ────────────────────────────────────────────────────────
// Uses Clerk unsafeMetadata to detect existing role — no localStorage needed.
// First login: no metadata.role → show RolePicker
// Subsequent logins: metadata.role exists → sync + redirect immediately
function SignedInHandler() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { user, isLoaded } = useUser();
  const [syncing, setSyncing] = useState(false);
  const [needsPicker, setNeedsPicker] = useState(false);

  useEffect(() => {
    if (!isLoaded || !user) return;

    const role = user.unsafeMetadata?.role;

    if (role === "user" || role === "employer") {
      // Returning user — sync to ensure DB record, then redirect
      setSyncing(true);
      syncUser(getToken, role)
        .then(() => navigate(role === "employer" ? "/emp/dashboard" : "/dashboard"))
        .catch(() => navigate(role === "employer" ? "/emp/dashboard" : "/dashboard"));
    } else {
      // Brand-new user — show picker
      setNeedsPicker(true);
    }
  }, [isLoaded, user]);

  if (!isLoaded || syncing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)]">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  if (needsPicker) return <RolePicker />;
  return null;
}

// ─── Landing Page ─────────────────────────────────────────────────────────────
export default function Landing() {
  return (
    <>
      <SignedIn>
        <SignedInHandler />
      </SignedIn>

      <SignedOut>
        <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg)] px-4">
          <div className="animate-slide-up text-center">
            {/* Logo */}
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-[14px] bg-[var(--primary)] text-white text-xl font-bold shadow-lg shadow-indigo-500/25">
              JS
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text)]">
              JobSphere
            </h1>
            <p className="mt-2 text-base text-[var(--text-secondary)]">
              Find your next opportunity or hire great talent.
            </p>

            {/* Auth buttons */}
            <div className="mt-8 flex justify-center gap-3">
              <SignInButton mode="modal">
                <Button id="sign-in-btn" size="lg">
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button id="sign-up-btn" variant="outline" size="lg">
                  Sign Up
                </Button>
              </SignUpButton>
            </div>
          </div>
        </div>
      </SignedOut>
    </>
  );
}
