import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { getEmployerJobs, createJob, deleteJob } from "@/api/api";
import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  Loader2,
  List,
  AlertTriangle,
} from "lucide-react";

const EMPTY_FORM = {
  title: "",
  company: "",
  description: "",
  additionalInfo: "",
  salaryMin: "",
  salaryMax: "",
  location: "",
  category: "",
};

function SkeletonTable() {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="p-4 space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="skeleton h-4 flex-[2]" />
              <div className="skeleton h-4 flex-1" />
              <div className="skeleton h-4 flex-1" />
              <div className="skeleton h-4 w-32" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Listings() {
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  function load() {
    setLoading(true);
    getEmployerJobs(getToken)
      .then(setJobs)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  function setField(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      await createJob(getToken, {
        ...form,
        salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
        salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
      });
      setShowForm(false);
      setForm(EMPTY_FORM);
      load();
    } catch (e) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteJob(getToken, deleteTarget._id);
      setJobs((prev) => prev.filter((j) => j._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (e) {
      alert(e.message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--text-secondary)]">
          {jobs.length} listing{jobs.length !== 1 ? "s" : ""}
        </p>
        <Button
          id="new-listing-btn"
          onClick={() => {
            setShowForm(true);
            setFormError("");
            setForm(EMPTY_FORM);
          }}
          className="gap-1"
        >
          <Plus className="h-4 w-4" />
          New Listing
        </Button>
      </div>

      {loading && <SkeletonTable />}
      {error && (
        <div className="flex flex-col items-center py-16">
          <p className="text-sm text-[var(--danger)]">{error}</p>
        </div>
      )}

      {!loading && jobs.length === 0 && (
        <div className="flex flex-col items-center py-20 text-center">
          <List className="h-10 w-10 text-[var(--text-muted)] mb-3" />
          <p className="text-sm font-medium text-[var(--text-secondary)]">
            No listings yet
          </p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Create a job listing to start receiving applications.
          </p>
        </div>
      )}

      {!loading && jobs.length > 0 && (
        <div className="animate-slide-up">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead className="w-40" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job._id}>
                  <TableCell className="font-medium text-[var(--text)]">
                    {job.title}
                  </TableCell>
                  <TableCell className="text-[var(--text-secondary)]">
                    {job.company}
                  </TableCell>
                  <TableCell className="text-[var(--text-secondary)]">
                    {job.location}
                  </TableCell>
                  <TableCell className="text-xs text-[var(--text-muted)]">
                    {job.salaryMin || job.salaryMax
                      ? `$${job.salaryMin?.toLocaleString()} – $${job.salaryMax?.toLocaleString()}`
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-[var(--text-muted)]"
                        onClick={() => navigate(`/emp/listings/${job._id}`)}
                        title="Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-[var(--text-muted)]"
                        onClick={() =>
                          navigate(`/emp/listings/${job._id}/edit`)
                        }
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-[var(--text-muted)] hover:text-[var(--danger)]"
                        onClick={() => setDeleteTarget(job)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create Job Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Job Listing</DialogTitle>
            <DialogDescription>
              Fill in the details for your job posting.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="job-title">Title *</Label>
                <Input
                  id="job-title"
                  name="title"
                  value={form.title}
                  onChange={setField}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="job-company">Company *</Label>
                <Input
                  id="job-company"
                  name="company"
                  value={form.company}
                  onChange={setField}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="job-location">Location *</Label>
                <Input
                  id="job-location"
                  name="location"
                  value={form.location}
                  onChange={setField}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="job-category">Category</Label>
                <Input
                  id="job-category"
                  name="category"
                  value={form.category}
                  onChange={setField}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="job-description">Description *</Label>
              <Textarea
                id="job-description"
                name="description"
                value={form.description}
                onChange={setField}
                required
                rows={3}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="job-additional">Additional Info</Label>
              <Input
                id="job-additional"
                name="additionalInfo"
                value={form.additionalInfo}
                onChange={setField}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="job-salaryMin">Salary Min</Label>
                <Input
                  id="job-salaryMin"
                  name="salaryMin"
                  type="number"
                  value={form.salaryMin}
                  onChange={setField}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="job-salaryMax">Salary Max</Label>
                <Input
                  id="job-salaryMax"
                  name="salaryMax"
                  type="number"
                  value={form.salaryMax}
                  onChange={setField}
                />
              </div>
            </div>
            {formError && (
              <p className="text-sm text-[var(--danger)]">{formError}</p>
            )}
            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
              <Button id="create-job-btn" type="submit" disabled={saving}>
                {saving && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Job
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-[var(--danger)]" />
              Delete Listing
            </DialogTitle>
            <DialogDescription>
              Delete <strong>{deleteTarget?.title}</strong> and all its
              applications? This cannot be undone.
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
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
