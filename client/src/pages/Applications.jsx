import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { getApplications, deleteApplication } from "@/api/api";
import { FileText, Trash2, Loader2, AlertTriangle, Briefcase, Calendar } from "lucide-react";

const STATUS_VARIANT = {
  Pending: "pending",
  Interview: "interview",
  Accepted: "accepted",
  Rejected: "rejected",
};

function SkeletonTable() {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)] overflow-hidden">
      <div className="p-4 space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex gap-4 items-center">
            <div className="skeleton h-4 flex-[2] rounded-md" />
            <div className="skeleton h-4 flex-1 rounded-md" />
            <div className="skeleton h-5 w-20 rounded-full" />
            <div className="skeleton h-4 w-24 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Mobile card for an application
function AppCard({ app, onDelete }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)] flex items-start justify-between gap-3 card-hover">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{app.job?.title ?? "—"}</p>
        <p className="text-xs text-[var(--text-secondary)] truncate mt-0.5">{app.job?.company ?? "—"}</p>
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <Badge variant={STATUS_VARIANT[app.status] ?? "secondary"}>{app.status}</Badge>
          <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(app.appliedAt).toLocaleDateString()}
          </span>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0 text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-bg)]"
        onClick={() => onDelete(app)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

export default function Applications() {
  const { getToken } = useAuth();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  function load() {
    setLoading(true);
    getApplications(getToken)
      .then(setApps)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteApplication(getToken, deleteTarget._id);
      setApps((prev) => prev.filter((a) => a._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (e) {
      alert(e.message);
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return <SkeletonTable />;
  if (error)
    return (
      <div className="flex flex-col items-center py-16">
        <p className="text-sm text-[var(--danger)]">{error}</p>
      </div>
    );

  if (apps.length === 0) {
    return (
      <div className="flex flex-col items-center py-20 text-center animate-fade-in-up">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--surface-raised)] border border-[var(--border)]">
          <FileText className="h-7 w-7 text-[var(--text-muted)]" />
        </div>
        <p className="text-base font-semibold text-[var(--text-primary)]">No applications yet</p>
        <p className="mt-1 text-sm text-[var(--text-muted)]">Browse jobs and start applying.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in-up">
      {/* Desktop: table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Applied</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {apps.map((app) => (
              <TableRow key={app._id}>
                <TableCell className="font-medium text-[var(--text-primary)]">
                  {app.job?.title ?? "—"}
                </TableCell>
                <TableCell className="text-[var(--text-secondary)]">
                  {app.job?.company ?? "—"}
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[app.status] ?? "secondary"}>
                    {app.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-[var(--text-muted)] text-xs">
                  {new Date(app.appliedAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-bg)]"
                    onClick={() => setDeleteTarget(app)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile: stacked cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {apps.map((app) => (
          <AppCard key={app._id} app={app} onDelete={setDeleteTarget} />
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--danger-bg)]">
                <AlertTriangle className="h-4 w-4 text-[var(--danger)]" />
              </span>
              Remove Application
            </DialogTitle>
            <DialogDescription>
              Remove your application for{" "}
              <strong>{deleteTarget?.job?.title}</strong>? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Remove
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
