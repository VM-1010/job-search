import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { getEmployerDashboard } from "@/api/api";
import { useCountUp } from "@/lib/utils";
import {
  Briefcase,
  Users,
  Clock,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Eye,
} from "lucide-react";

const STATS = [
  { key: "jobsPosted", label: "Jobs Posted",  icon: Briefcase,    color: "text-[var(--accent)]",     bg: "bg-[var(--accent-soft)]"  },
  { key: "total",      label: "Total Apps",   icon: Users,         color: "text-[var(--text-secondary)]", bg: "bg-[var(--surface-raised)]" },
  { key: "pending",    label: "Pending",      icon: Clock,         color: "text-[var(--warning)]",    bg: "bg-[var(--warning-bg)]"  },
  { key: "interview",  label: "Interview",    icon: MessageSquare, color: "text-[var(--info)]",       bg: "bg-[var(--info-bg)]"     },
  { key: "accepted",   label: "Accepted",     icon: CheckCircle2,  color: "text-[var(--success)]",    bg: "bg-[var(--success-bg)]"  },
  { key: "rejected",   label: "Rejected",     icon: XCircle,       color: "text-[var(--danger)]",     bg: "bg-[var(--danger-bg)]"   },
];

const STATUS_VARIANT = {
  Pending: "pending",
  Interview: "interview",
  Accepted: "accepted",
  Rejected: "rejected",
};

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

function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <div className="skeleton h-3 w-20 mb-3" />
              <div className="skeleton h-8 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function EmpDashboard() {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getEmployerDashboard(getToken)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [getToken]);

  if (loading) return <SkeletonDashboard />;
  if (error)
    return (
      <div className="flex flex-col items-center py-16">
        <p className="text-sm text-[var(--danger)]">{error}</p>
      </div>
    );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
          Employer Dashboard
        </h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Overview of your jobs and applicant activity.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {STATS.map(({ key, label, icon, color, bg }, i) => (
          <StatCard
            key={key}
            label={label}
            icon={icon}
            color={color}
            bg={bg}
            value={data[key] ?? 0}
            delay={i * 55}
          />
        ))}
      </div>

      {/* Recent Applications */}
      <div>
        <h3 className="mb-3 text-base font-semibold tracking-tight text-[var(--text-primary)]">
          Recent Applications
        </h3>
        {data.recentApplications?.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center rounded-xl border border-[var(--border)] bg-[var(--surface)]">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surface-raised)]">
              <Users className="h-6 w-6 text-[var(--text-muted)]" />
            </div>
            <p className="text-sm font-medium text-[var(--text-secondary)]">No applications yet</p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">Applications will appear here once candidates apply.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applied</TableHead>
                <TableHead className="w-16" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.recentApplications?.map((app) => (
                <TableRow key={app._id}>
                  <TableCell className="font-medium text-[var(--text-primary)]">
                    {app.applicantName ?? app.user?.clerkId ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[app.status] ?? "secondary"}>
                      {app.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-[var(--text-muted)]">
                    {new Date(app.appliedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1"
                      onClick={() => navigate(`/emp/applicant/${app.user?._id}`)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
