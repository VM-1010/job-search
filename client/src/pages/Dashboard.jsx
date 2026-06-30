import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Card, CardContent } from "@/components/ui/card";
import { getDashboard } from "@/api/api";
import { useCountUp } from "@/lib/utils";
import {
  Send,
  Clock,
  MessageSquare,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const STATS = [
  { key: "applied",   label: "Total Applied", icon: Send,          color: "text-[var(--accent)]",  bg: "bg-[var(--accent-soft)]" },
  { key: "pending",   label: "Pending",        icon: Clock,         color: "text-[var(--warning)]", bg: "bg-[var(--warning-bg)]" },
  { key: "interview", label: "Interview",      icon: MessageSquare, color: "text-[var(--info)]",    bg: "bg-[var(--info-bg)]" },
  { key: "accepted",  label: "Accepted",       icon: CheckCircle2,  color: "text-[var(--success)]", bg: "bg-[var(--success-bg)]" },
  { key: "rejected",  label: "Rejected",       icon: XCircle,       color: "text-[var(--danger)]",  bg: "bg-[var(--danger-bg)]" },
];

// Animated stat card — hook must be inside a component
function StatCard({ label, icon: Icon, color, bg, value, delay }) {
  const count = useCountUp(value);
  return (
    <Card
      className="stagger stat-card-accent overflow-hidden"
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
            {label}
          </p>
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${bg}`}>
            <Icon className={`h-4 w-4 ${color}`} />
          </div>
        </div>
        <p className={`mt-3 text-2xl font-bold tracking-tight ${color}`}>{count}</p>
      </CardContent>
    </Card>
  );
}

function SkeletonCards() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {[...Array(5)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-5">
            <div className="skeleton h-3 w-20 mb-3" />
            <div className="skeleton h-8 w-12" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { getToken } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getDashboard(getToken)
      .then(setStats)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [getToken]);

  if (loading) return <SkeletonCards />;
  if (error)
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-sm text-[var(--danger)]">{error}</p>
      </div>
    );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
          Welcome back! 👋
        </h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Here's a summary of your job applications.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {STATS.map(({ key, label, icon, color, bg }, i) => (
          <StatCard
            key={key}
            label={label}
            icon={icon}
            color={color}
            bg={bg}
            value={stats[key] ?? 0}
            delay={i * 60}
          />
        ))}
      </div>
    </div>
  );
}
