import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  getEmployerJobs,
  updateJob,
  getJobApplications,
  updateApplicationStatus,
} from "@/api/api";
import {
  ArrowLeft,
  Pencil,
  Loader2,
  Users,
  MapPin,
  DollarSign,
  CheckCircle2,
  Eye,
} from "lucide-react";

const STATUSES = ["Pending", "Interview", "Accepted", "Rejected"];
const STATUS_VARIANT = {
  Pending: "pending",
  Interview: "interview",
  Accepted: "accepted",
  Rejected: "rejected",
};

function SkeletonDetail() {
  return (
    <div className="max-w-3xl space-y-4">
      <div className="skeleton h-6 w-48" />
      <div className="skeleton h-4 w-32" />
      <div className="skeleton h-20 w-full" />
    </div>
  );
}

export default function ListingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEdit = location.pathname.endsWith("/edit");
  const { getToken } = useAuth();

  const [job, setJob] = useState(null);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    Promise.all([
      getEmployerJobs(getToken).then(
        (jobs) => jobs.find((j) => j._id === id) ?? null
      ),
      getJobApplications(getToken, id),
    ])
      .then(([j, a]) => {
        setJob(j);
        setApps(a);
        if (j)
          setForm({
            title: j.title,
            company: j.company,
            location: j.location,
            description: j.description,
            additionalInfo: j.additionalInfo ?? "",
            salaryMin: j.salaryMin ?? "",
            salaryMax: j.salaryMax ?? "",
            category: j.category ?? "",
          });
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, getToken]);

  function setField(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setSaveMsg("");
    try {
      const updated = await updateJob(getToken, id, {
        ...form,
        salaryMin: form.salaryMin !== "" ? Number(form.salaryMin) : undefined,
        salaryMax: form.salaryMax !== "" ? Number(form.salaryMax) : undefined,
      });
      setJob(updated);
      setSaveMsg("Changes saved.");
      setTimeout(() => {
        setSaveMsg("");
        navigate(`/emp/listings/${id}`);
      }, 800);
    } catch (e) {
      setSaveMsg(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(appId, status) {
    try {
      const updated = await updateApplicationStatus(getToken, appId, status);
      setApps((prev) =>
        prev.map((a) =>
          a._id === appId ? { ...a, status: updated.status } : a
        )
      );
    } catch (e) {
      alert(e.message);
    }
  }

  if (loading) return <SkeletonDetail />;
  if (error)
    return (
      <div className="flex flex-col items-center py-16">
        <p className="text-sm text-[var(--danger)]">{error}</p>
      </div>
    );
  if (!job)
    return (
      <p className="text-sm text-[var(--text-secondary)]">Job not found.</p>
    );

  return (
    <div className="max-w-3xl space-y-6 animate-slide-up">
      {/* Back + Edit */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1"
          onClick={() => navigate("/emp/listings")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        {!isEdit && (
          <Button
            size="sm"
            variant="outline"
            className="gap-1"
            onClick={() => navigate(`/emp/listings/${id}/edit`)}
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
        )}
      </div>

      {/* Edit Form */}
      {isEdit ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Edit Listing</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Title *</Label>
                  <Input
                    name="title"
                    value={form.title}
                    onChange={setField}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Company *</Label>
                  <Input
                    name="company"
                    value={form.company}
                    onChange={setField}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Location *</Label>
                  <Input
                    name="location"
                    value={form.location}
                    onChange={setField}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <Input
                    name="category"
                    value={form.category}
                    onChange={setField}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Salary Min</Label>
                  <Input
                    name="salaryMin"
                    type="number"
                    value={form.salaryMin}
                    onChange={setField}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Salary Max</Label>
                  <Input
                    name="salaryMax"
                    type="number"
                    value={form.salaryMax}
                    onChange={setField}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Description *</Label>
                <Textarea
                  name="description"
                  value={form.description}
                  onChange={setField}
                  required
                  rows={4}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Additional Info</Label>
                <Input
                  name="additionalInfo"
                  value={form.additionalInfo}
                  onChange={setField}
                />
              </div>
              {saveMsg && (
                <div className="flex items-center gap-2 text-sm text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                  {saveMsg}
                </div>
              )}
              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>
                  {saving && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/emp/listings/${id}`)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        /* View Mode */
        <Card>
          <CardContent className="p-5 space-y-3">
            <h2 className="text-lg font-bold text-[var(--text)]">
              {job.title}
            </h2>
            <div className="flex flex-wrap gap-2 text-sm text-[var(--text-secondary)]">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {job.company} · {job.location}
              </span>
              {(job.salaryMin || job.salaryMax) && (
                <Badge variant="outline">
                  <DollarSign className="mr-0.5 h-3 w-3" />
                  {job.salaryMin?.toLocaleString()} –{" "}
                  {job.salaryMax?.toLocaleString()}
                </Badge>
              )}
              {job.category && (
                <Badge variant="secondary">{job.category}</Badge>
              )}
            </div>
            <p className="whitespace-pre-wrap text-sm text-[var(--text)]">
              {job.description}
            </p>
            {job.additionalInfo && (
              <p className="whitespace-pre-wrap text-xs text-[var(--text-muted)] border-t border-[var(--border)] pt-3">
                {job.additionalInfo}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Applicants */}
      <div>
        <h3 className="mb-3 text-base font-semibold text-[var(--text)]">
          Applicants ({apps.length})
        </h3>
        {apps.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <Users className="h-8 w-8 text-[var(--text-muted)] mb-2" />
            <p className="text-sm text-[var(--text-secondary)]">
              No applicants yet.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Applied</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-48" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {apps.map((app) => (
                <TableRow key={app._id}>
                  <TableCell className="font-medium text-[var(--text)]">
                    {app.applicantName ?? "—"}
                  </TableCell>
                  <TableCell className="text-xs text-[var(--text-muted)]">
                    {new Date(app.appliedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={STATUS_VARIANT[app.status] ?? "secondary"}
                    >
                      {app.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Select
                        value={app.status}
                        onValueChange={(s) =>
                          handleStatusChange(app._id, s)
                        }
                      >
                        <SelectTrigger className="w-32 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-1 text-[var(--text-secondary)]"
                        onClick={() =>
                          navigate(`/emp/applicant/${app.user?._id}`)
                        }
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Profile
                      </Button>
                    </div>
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
