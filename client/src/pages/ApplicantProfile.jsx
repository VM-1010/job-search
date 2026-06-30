import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getApplicantProfile } from "@/api/api";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Download,
  GraduationCap,
  Briefcase,
  Award,
  Trophy,
  UserCircle,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Section({ title, icon: Icon, items }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="space-y-2.5">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--accent-soft)]">
          <Icon className="h-3.5 w-3.5 text-[var(--accent)]" />
        </span>
        {title}
      </h3>
      <ul className="space-y-1.5 pl-8">
        {items.map((item, i) => (
          <li
            key={i}
            className="relative text-sm text-[var(--text-secondary)] leading-snug list-disc"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SkeletonProfile() {
  return (
    <div className="max-w-xl space-y-4">
      <div className="skeleton h-5 w-40 rounded-md" />
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 space-y-4">
        <div className="flex items-start gap-4">
          <div className="skeleton h-14 w-14 rounded-full" />
          <div className="space-y-2 flex-1">
            <div className="skeleton h-5 w-36 rounded-md" />
            <div className="skeleton h-3 w-28 rounded-md" />
          </div>
        </div>
        <div className="skeleton h-20 w-full rounded-lg" />
      </div>
    </div>
  );
}

export default function ApplicantProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getApplicantProfile(getToken, userId)
      .then(setProfile)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [userId, getToken]);

  if (loading) return <SkeletonProfile />;
  if (error)
    return (
      <div className="flex flex-col items-center py-16">
        <p className="text-sm text-[var(--danger)]">{error}</p>
      </div>
    );
  if (!profile)
    return (
      <div className="flex flex-col items-center py-20 text-center animate-fade-in-up">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--surface-raised)] border border-[var(--border)]">
          <UserCircle className="h-7 w-7 text-[var(--text-muted)]" />
        </div>
        <p className="text-base font-semibold text-[var(--text-primary)]">No profile found</p>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          This applicant hasn't set up their profile yet.
        </p>
      </div>
    );

  const initials = (profile.name || "?")[0].toUpperCase();

  return (
    <div className="max-w-xl space-y-4 animate-fade-in-up">
      <Button
        variant="ghost"
        size="sm"
        className="gap-1"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <Card>
        <CardHeader className="pb-0">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-white text-lg font-bold shadow-sm"
              style={{ background: "linear-gradient(135deg, #5B5BF6 0%, #7C7CF9 100%)" }}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold tracking-tight text-[var(--text-primary)] leading-tight">
                {profile.name || "—"}
              </h2>
              <div className="mt-1 flex flex-col gap-0.5">
                {profile.place && (
                  <p className="flex items-center gap-1 text-sm text-[var(--text-secondary)]">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    {profile.place}
                  </p>
                )}
                {profile.contact && (
                  <p className="flex items-center gap-1 text-sm text-[var(--text-muted)]">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    {profile.contact}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 pt-4">
          {profile.about && (
            <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed">
              {profile.about}
            </p>
          )}

          {profile.resumeUrl && (
            <a
              href={`${API_URL}${profile.resumeUrl}`}
              target="_blank"
              rel="noreferrer"
              className={[
                "inline-flex items-center gap-2 rounded-lg border border-[var(--border)]",
                "px-3 py-1.5 text-sm text-[var(--accent)] transition-all duration-150",
                "hover:bg-[var(--accent-soft)] hover:border-[var(--accent-soft-border)]",
              ].join(" ")}
            >
              <Download className="h-4 w-4" />
              Download Resume
            </a>
          )}

          {(profile.education?.length > 0 ||
            profile.experience?.length > 0 ||
            profile.training?.length > 0 ||
            profile.competitions?.length > 0) && <Separator />}

          <Section
            title="Education"
            icon={GraduationCap}
            items={profile.education}
          />
          <Section
            title="Experience"
            icon={Briefcase}
            items={profile.experience}
          />
          <Section title="Training" icon={Award} items={profile.training} />
          <Section
            title="Competitions"
            icon={Trophy}
            items={profile.competitions}
          />
        </CardContent>
      </Card>
    </div>
  );
}
