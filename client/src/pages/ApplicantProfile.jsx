import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
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
    <div className="space-y-2">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
        <Icon className="h-4 w-4 text-[var(--text-muted)]" />
        {title}
      </h3>
      <ul className="space-y-1.5 pl-6">
        {items.map((item, i) => (
          <li
            key={i}
            className="text-sm text-[var(--text-secondary)] list-disc"
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
    <Card className="max-w-xl">
      <CardContent className="p-5 space-y-4">
        <div className="skeleton h-6 w-40" />
        <div className="skeleton h-4 w-28" />
        <div className="skeleton h-20 w-full" />
      </CardContent>
    </Card>
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
      <div className="flex flex-col items-center py-20 text-center">
        <UserCircle className="h-10 w-10 text-[var(--text-muted)] mb-3" />
        <p className="text-sm text-[var(--text-secondary)]">
          No profile found for this applicant.
        </p>
      </div>
    );

  return (
    <div className="max-w-xl space-y-4 animate-slide-up">
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
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary-light)] text-[var(--primary)] text-lg font-bold">
              {(profile.name || "?")[0].toUpperCase()}
            </div>
            <div>
              <CardTitle className="text-lg">
                {profile.name || "—"}
              </CardTitle>
              {profile.place && (
                <p className="mt-0.5 flex items-center gap-1 text-sm text-[var(--text-secondary)]">
                  <MapPin className="h-3.5 w-3.5" />
                  {profile.place}
                </p>
              )}
              {profile.contact && (
                <p className="mt-0.5 flex items-center gap-1 text-sm text-[var(--text-muted)]">
                  <Phone className="h-3.5 w-3.5" />
                  {profile.contact}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {profile.about && (
            <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">
              {profile.about}
            </p>
          )}

          {profile.resumeUrl && (
            <a
              href={`${API_URL}${profile.resumeUrl}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--primary)] transition-colors hover:bg-[var(--primary-light)]"
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
