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
import { syncUser } from "@/api/api";
import { useInView } from "@/lib/utils";
import {
  Briefcase,
  Building2,
  Loader2,
  Search,
  Zap,
  Users,
  Check,
  ArrowRight,
} from "lucide-react";

// ─── Role Picker ──────────────────────────────────────────────────────────────
function RolePicker() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");

  async function choose(role) {
    setSelected(role);
    setLoading(true);
    setError("");
    try {
      await syncUser(getToken, role);
      await user.update({ unsafeMetadata: { role } });
      navigate(role === "employer" ? "/emp/dashboard" : "/dashboard");
    } catch (e) {
      setError(e.message || "Something went wrong. Please try again.");
      setLoading(false);
      setSelected(null);
    }
  }

  const roles = [
    {
      id: "user",
      label: "Job Seeker",
      description: "Find your next opportunity and track applications",
      icon: Briefcase,
    },
    {
      id: "employer",
      label: "Employer",
      description: "Post jobs, review applicants, and hire top talent",
      icon: Building2,
    },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-4">
      <div className="gradient-mesh" />
      <div className="animate-fade-in-up w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div
            className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-white text-base font-bold shadow-lg"
            style={{ background: "linear-gradient(135deg, #5B5BF6 0%, #7C7CF9 100%)" }}
          >
            JS
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Welcome to JobSphere
          </h1>
          <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
            How will you use the platform?
          </p>
        </div>

        {/* Role cards */}
        <div className="grid grid-cols-2 gap-3">
          {roles.map(({ id, label, description, icon: Icon }) => {
            const isSelected = selected === id;
            return (
              <button
                key={id}
                disabled={loading}
                onClick={() => choose(id)}
                className={[
                  "group relative flex flex-col items-center gap-3 rounded-xl border p-6 text-left",
                  "transition-all duration-200 cursor-pointer disabled:opacity-60",
                  isSelected
                    ? "border-[var(--accent)] bg-[var(--accent-soft)] shadow-md shadow-[var(--accent-soft)]"
                    : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent-soft-border)] hover:shadow-md hover:-translate-y-0.5",
                ].join(" ")}
              >
                {isSelected && (
                  <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent)]">
                    <Check className="h-3 w-3 text-white" />
                  </span>
                )}
                <div
                  className={[
                    "flex h-11 w-11 items-center justify-center rounded-full transition-colors",
                    isSelected
                      ? "bg-[var(--accent)] text-white"
                      : "bg-[var(--accent-soft)] text-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-white",
                  ].join(" ")}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{label}</p>
                  <p className="mt-0.5 text-xs text-[var(--text-muted)] leading-snug">{description}</p>
                </div>
              </button>
            );
          })}
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
      setSyncing(true);
      syncUser(getToken, role)
        .then(() => navigate(role === "employer" ? "/emp/dashboard" : "/dashboard"))
        .catch(() => navigate(role === "employer" ? "/emp/dashboard" : "/dashboard"));
    } else {
      setNeedsPicker(true);
    }
  }, [isLoaded, user]);

  if (!isLoaded || syncing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)]">
        <div className="flex flex-col items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl text-white text-sm font-bold"
            style={{ background: "linear-gradient(135deg, #5B5BF6 0%, #7C7CF9 100%)" }}
          >
            JS
          </div>
          <Loader2 className="h-5 w-5 animate-spin text-[var(--accent)]" />
        </div>
      </div>
    );
  }

  if (needsPicker) return <RolePicker />;
  return null;
}

// ─── Feature Section ──────────────────────────────────────────────────────────
function FeatureCard({ icon: Icon, title, description, delay }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className="flex flex-col items-center text-center p-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)] transition-all duration-300"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(16px)",
        transition: `opacity 0.4s ease-out ${delay}ms, transform 0.4s ease-out ${delay}ms`,
      }}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-soft)]">
        <Icon className="h-6 w-6 text-[var(--accent)]" />
      </div>
      <h3 className="text-base font-semibold text-[var(--text-primary)]">{title}</h3>
      <p className="mt-1.5 text-sm text-[var(--text-secondary)] leading-relaxed">{description}</p>
    </div>
  );
}

// ─── Landing Page ─────────────────────────────────────────────────────────────
export default function Landing() {
  return (
    <>
      <SignedIn>
        <SignedInHandler />
      </SignedIn>

      <SignedOut>
        <div className="min-h-screen bg-[var(--bg)]">
          <div className="gradient-mesh" />

          {/* Hero */}
          <section className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
            <div className="animate-fade-in-up max-w-2xl mx-auto">
              {/* Logo badge */}
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl text-white text-xl font-bold shadow-xl shadow-indigo-500/25"
                style={{ background: "linear-gradient(135deg, #5B5BF6 0%, #7C7CF9 100%)" }}>
                JS
              </div>

              {/* Headline */}
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[var(--accent-soft-border)] bg-[var(--accent-soft)] px-3 py-1 mb-5">
                <Zap className="h-3.5 w-3.5 text-[var(--accent)]" />
                <span className="text-xs font-medium text-[var(--accent)]">Modern recruiting platform</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[var(--text-primary)] leading-tight">
                Find Your Next{" "}
                <span style={{ background: "linear-gradient(135deg, #5B5BF6 0%, #7C7CF9 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Opportunity
                </span>
              </h1>
              <p className="mt-4 text-base sm:text-lg text-[var(--text-secondary)] max-w-lg mx-auto leading-relaxed">
                Connect with top companies and talented professionals. The hiring platform built for speed, clarity, and results.
              </p>

              {/* CTAs */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <SignUpButton mode="modal">
                  <Button id="sign-up-btn" size="lg" className="gap-2">
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </SignUpButton>
                <SignInButton mode="modal">
                  <Button id="sign-in-btn" size="lg" variant="outline">
                    Sign In
                  </Button>
                </SignInButton>
              </div>

              {/* Social proof */}
              <p className="mt-5 text-xs text-[var(--text-muted)]">
                Trusted by job seekers and employers across industries
              </p>
            </div>
          </section>

          {/* Features */}
          <section className="pb-24 px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                  Everything you need, in one place
                </h2>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  Built for both sides of the hiring table
                </p>
              </div>
              <div className="grid gap-5 sm:grid-cols-3">
                <FeatureCard
                  icon={Search}
                  title="Smart Job Search"
                  description="Filter by company, location, salary, and role. Find exactly what you're looking for."
                  delay={0}
                />
                <FeatureCard
                  icon={Users}
                  title="Hire Top Talent"
                  description="Post jobs, receive applications, and manage your entire hiring pipeline in one view."
                  delay={80}
                />
                <FeatureCard
                  icon={Zap}
                  title="Streamlined Process"
                  description="From application to offer — track every step with real-time status updates."
                  delay={160}
                />
              </div>
            </div>
          </section>
        </div>
      </SignedOut>
    </>
  );
}
