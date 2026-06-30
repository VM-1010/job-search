import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/clerk-react";
import JobCard from "@/components/JobCard";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { getJobs, applyToJob } from "@/api/api";
import {
  Search,
  MapPin,
  DollarSign,
  Building2,
  Briefcase,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

function SkeletonGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-5 space-y-3">
            <div className="skeleton h-4 w-3/4" />
            <div className="skeleton h-3 w-1/2" />
            <div className="skeleton h-3 w-1/3" />
            <div className="flex gap-2 pt-2">
              <div className="skeleton h-8 flex-1" />
              <div className="skeleton h-8 flex-1" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function Jobs() {
  const { getToken } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    company: "",
    search: "",
    location: "",
    salaryMin: "",
    salaryMax: "",
  });

  const [infoJob, setInfoJob] = useState(null);
  const [applyJob, setApplyJob] = useState(null);
  const [applyMsg, setApplyMsg] = useState("");
  const [applyStatus, setApplyStatus] = useState(""); // success | error | ""
  const [applying, setApplying] = useState(false);

  const fetchJobs = useCallback(() => {
    setLoading(true);
    setError("");
    getJobs(getToken, filters)
      .then(setJobs)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [getToken, filters]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  function handleFilterChange(e) {
    setFilters((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleApply(job) {
    setApplyJob(job);
    setApplyMsg("");
    setApplyStatus("");
  }

  async function confirmApply() {
    if (!applyJob) return;
    setApplying(true);
    setApplyMsg("");
    setApplyStatus("");
    try {
      await applyToJob(getToken, applyJob._id);
      setApplyMsg("Application submitted successfully!");
      setApplyStatus("success");
      fetchJobs();
    } catch (e) {
      setApplyMsg(
        e.status === 409
          ? "You've already applied to this job."
          : e.message || "Failed to apply.",
      );
      setApplyStatus("error");
    } finally {
      setApplying(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]" />
              <Input
                name="search"
                placeholder="Search title…"
                value={filters.search}
                onChange={handleFilterChange}
                className="pl-9"
              />
            </div>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]" />
              <Input
                name="company"
                placeholder="Company…"
                value={filters.company}
                onChange={handleFilterChange}
                className="pl-9"
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]" />
              <Input
                name="location"
                placeholder="Location…"
                value={filters.location}
                onChange={handleFilterChange}
                className="pl-9"
              />
            </div>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]" />
              <Input
                name="salaryMin"
                placeholder="Min salary"
                value={filters.salaryMin}
                onChange={handleFilterChange}
                type="number"
                className="pl-9"
              />
            </div>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]" />
              <Input
                name="salaryMax"
                placeholder="Max salary"
                value={filters.salaryMax}
                onChange={handleFilterChange}
                type="number"
                className="pl-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* States */}
      {loading && <SkeletonGrid />}
      {error && (
        <div className="flex flex-col items-center py-16 text-center">
          <AlertCircle className="h-8 w-8 text-[var(--danger)] mb-2" />
          <p className="text-sm text-[var(--danger)]">{error}</p>
        </div>
      )}
      {!loading && !error && jobs.length === 0 && (
        <div className="flex flex-col items-center py-20 text-center">
          <Briefcase className="h-10 w-10 text-[var(--text-muted)] mb-3" />
          <p className="text-sm font-medium text-[var(--text-secondary)]">
            No jobs found
          </p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Try adjusting your filters.
          </p>
        </div>
      )}

      {/* Job grid */}
      {!loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job, i) => (
            <JobCard
              key={job._id}
              job={job}
              onApply={handleApply}
              onInfo={setInfoJob}
              style={{ animationDelay: `${i * 40}ms` }}
            />
          ))}
        </div>
      )}

      {/* Info Dialog */}
      <Dialog open={!!infoJob} onOpenChange={(o) => !o && setInfoJob(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{infoJob?.title}</DialogTitle>
            <DialogDescription>
              {infoJob?.company} · {infoJob?.location}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm text-[var(--text-secondary)]">
            {(infoJob?.salaryMin || infoJob?.salaryMax) && (
              <div className="flex gap-2">
                <Badge variant="outline">
                  ${infoJob?.salaryMin?.toLocaleString()} – $
                  {infoJob?.salaryMax?.toLocaleString()}
                </Badge>
              </div>
            )}
            {infoJob?.category && (
              <Badge variant="secondary">{infoJob.category}</Badge>
            )}
            <p className="whitespace-pre-wrap text-[var(--text)]">
              {infoJob?.description}
            </p>
            {infoJob?.additionalInfo && (
              <p className="whitespace-pre-wrap text-[var(--text-muted)] text-xs border-t border-[var(--border)] pt-3">
                {infoJob.additionalInfo}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Apply Dialog */}
      <Dialog open={!!applyJob} onOpenChange={(o) => !o && setApplyJob(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Apply to {applyJob?.title}</DialogTitle>
            <DialogDescription>{applyJob?.company}</DialogDescription>
          </DialogHeader>

          {applyMsg ? (
            <div className="flex flex-col items-center gap-2 py-2 text-center">
              {applyStatus === "success" ? (
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              ) : (
                <AlertCircle className="h-8 w-8 text-[var(--danger)]" />
              )}
              <p className="text-sm text-[var(--text-secondary)]">{applyMsg}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setApplyJob(null)}
                className="mt-2"
              >
                Close
              </Button>
            </div>
          ) : (
            <>
              <p className="text-sm text-[var(--text-secondary)]">
                Confirm your application for this position.
              </p>
              <div className="flex justify-end gap-2 pt-1">
                <Button variant="outline" onClick={() => setApplyJob(null)}>
                  Cancel
                </Button>
                <Button
                  id="confirm-apply-btn"
                  onClick={confirmApply}
                  disabled={applying}
                >
                  {applying && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Confirm Apply
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
