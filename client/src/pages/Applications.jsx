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
import { FileText, Trash2, Loader2, AlertTriangle } from "lucide-react";

const STATUS_VARIANT = {
  Pending: "pending",
  Interview: "interview",
  Accepted: "accepted",
  Rejected: "rejected",
};

function SkeletonTable() {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="p-4 space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="skeleton h-4 flex-[2]" />
              <div className="skeleton h-4 flex-1" />
              <div className="skeleton h-4 w-20" />
              <div className="skeleton h-4 w-24" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
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
      <div className="flex flex-col items-center py-20 text-center">
        <FileText className="h-10 w-10 text-[var(--text-muted)] mb-3" />
        <p className="text-sm font-medium text-[var(--text-secondary)]">
          No applications yet
        </p>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          Browse jobs and start applying.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-slide-up">
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
              <TableCell className="font-medium text-[var(--text)]">
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
                  className="h-8 w-8 text-[var(--text-muted)] hover:text-[var(--danger)]"
                  onClick={() => setDeleteTarget(app)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-[var(--danger)]" />
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
