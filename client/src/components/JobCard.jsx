import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, DollarSign } from "lucide-react";

export default function JobCard({ job, onApply, onInfo, style }) {
  return (
    <Card className="card-hover flex flex-col" style={style}>
      <CardContent className="flex flex-1 flex-col gap-3 p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold text-[var(--text)] leading-tight truncate">
              {job.title}
            </h2>
            <p className="mt-0.5 text-sm text-[var(--text-secondary)] truncate">
              {job.company}
            </p>
          </div>
          {job.category && (
            <Badge variant="secondary" className="shrink-0">
              {job.category}
            </Badge>
          )}
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--text-muted)]">
          {job.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {job.location}
            </span>
          )}
          {(job.salaryMin || job.salaryMax) && (
            <span className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              {job.salaryMin?.toLocaleString()} – {job.salaryMax?.toLocaleString()}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {job.applicantCount ?? 0} applicant{job.applicantCount !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Actions */}
        <div className="mt-auto flex gap-2 pt-2">
          <Button size="sm" onClick={() => onApply(job)} className="flex-1">
            Apply
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onInfo(job)}
            className="flex-1"
          >
            Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
