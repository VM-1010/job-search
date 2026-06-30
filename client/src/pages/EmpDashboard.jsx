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
  { key: "jobsPosted", label: "Jobs Posted", icon: Briefcase, color: "text-[var(--primary)]", bg: "bg-indigo-50" },
  { key: "total", label: "Total Apps", icon: Users, color: "text-slate-600", bg: "bg-slate-50" },
  { key: "pending", label: "Pending", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
  { key: "interview", label: "Interview", icon: MessageSquare, color: "text-blue-600", bg: "bg-blue-50" },
  { key: "accepted", label: "Accepted", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
  { key: "rejected", label: "Rejected", icon: XCircle, color: "text-red-500", bg: "bg-red-50" },
];

const STATUS_VARIANT = {
  Pending: "pending",
  Interview: "interview",
  Accepted: "accepted",
  Rejected: "rejected",
};

function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <div className="skeleton h-4 w-20 mb-3" />
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
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {STATS.map(({ key, label, icon: Icon, color, bg }, i) => (
          <Card
            key={key}
            className="stagger"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                  {label}
                </p>
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-[8px] ${bg}`}
                >
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
              </div>
              <p className={`mt-2 text-2xl font-bold ${color}`}>
                {data[key] ?? 0}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Applications */}
      <div>
        <h2 className="mb-3 text-base font-semibold text-[var(--text)]">
          Recent Applications
        </h2>
        {data.recentApplications?.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <Users className="h-8 w-8 text-[var(--text-muted)] mb-2" />
            <p className="text-sm text-[var(--text-secondary)]">
              No applications yet.
            </p>
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
                  <TableCell className="font-medium text-[var(--text)]">
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
                      className="gap-1 text-[var(--text-secondary)]"
                      onClick={() =>
                        navigate(`/emp/applicant/${app.user?._id}`)
                      }
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
