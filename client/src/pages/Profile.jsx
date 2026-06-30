import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getProfile, updateProfile, uploadResume } from "@/api/api";
import { Plus, X, Loader2, Upload, Download, CheckCircle2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ─── Repeatable List ──────────────────────────────────────────────────────────
function RepeatableList({ label, items, onChange }) {
  function update(i, val) {
    const next = [...items];
    next[i] = val;
    onChange(next);
  }
  function add() { onChange([...items, ""]); }
  function remove(i) { onChange(items.filter((_, idx) => idx !== i)); }

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-[var(--text-primary)]">{label}</Label>
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <Input
            value={item}
            onChange={(e) => update(i, e.target.value)}
            placeholder={`Add ${label.toLowerCase()}…`}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0 text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-bg)]"
            onClick={() => remove(i)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={add}
        className="gap-1"
      >
        <Plus className="h-3.5 w-3.5" />
        Add {label}
      </Button>
    </div>
  );
}

const EMPTY = {
  name: "",
  place: "",
  contact: "",
  about: "",
  education: [],
  experience: [],
  training: [],
  competitions: [],
};

function SkeletonForm() {
  return (
    <div className="max-w-2xl space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="skeleton h-3 w-20 rounded-md" />
          <div className="skeleton h-9 w-full rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export default function Profile() {
  const { getToken } = useAuth();

  const [form, setForm] = useState(EMPTY);
  const [resumeUrl, setResumeUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    getProfile(getToken)
      .then((p) => {
        setForm({
          name: p.name ?? "",
          place: p.place ?? "",
          contact: p.contact ?? "",
          about: p.about ?? "",
          education: p.education ?? [],
          experience: p.experience ?? [],
          training: p.training ?? [],
          competitions: p.competitions ?? [],
        });
        setResumeUrl(p.resumeUrl ?? "");
      })
      .catch((e) => {
        if (e.status !== 404) setError(e.message);
      })
      .finally(() => setLoading(false));
  }, [getToken]);

  function setField(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      await updateProfile(getToken, form);
      setMessage("Profile saved successfully.");
      setTimeout(() => setMessage(""), 3000);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleResumeUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMessage("");
    setError("");
    try {
      const res = await uploadResume(getToken, file);
      setResumeUrl(res.resumeUrl);
      setMessage("Resume uploaded.");
      setTimeout(() => setMessage(""), 3000);
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  }

  if (loading) return <SkeletonForm />;

  return (
    <form onSubmit={handleSave} className="max-w-2xl space-y-6 animate-fade-in-up">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="profile-name">Full Name</Label>
              <Input
                id="profile-name"
                value={form.name}
                onChange={setField("name")}
                placeholder="Jane Doe"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="profile-place">Location</Label>
              <Input
                id="profile-place"
                value={form.place}
                onChange={setField("place")}
                placeholder="City, Country"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="profile-contact">Contact</Label>
              <Input
                id="profile-contact"
                value={form.contact}
                onChange={setField("contact")}
                placeholder="Phone or email"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="profile-about">About</Label>
            <Textarea
              id="profile-about"
              value={form.about}
              onChange={setField("about")}
              placeholder="Tell employers about yourself…"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Background Lists */}
      <Card>
        <CardHeader>
          <CardTitle>Background</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <RepeatableList
            label="Education"
            items={form.education}
            onChange={(v) => setForm((f) => ({ ...f, education: v }))}
          />
          <Separator />
          <RepeatableList
            label="Experience"
            items={form.experience}
            onChange={(v) => setForm((f) => ({ ...f, experience: v }))}
          />
          <Separator />
          <RepeatableList
            label="Training"
            items={form.training}
            onChange={(v) => setForm((f) => ({ ...f, training: v }))}
          />
          <Separator />
          <RepeatableList
            label="Competitions"
            items={form.competitions}
            onChange={(v) => setForm((f) => ({ ...f, competitions: v }))}
          />
        </CardContent>
      </Card>

      {/* Resume */}
      <Card>
        <CardHeader>
          <CardTitle>Resume</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {resumeUrl && (
            <a
              href={`${API_URL}${resumeUrl}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm text-[var(--accent)] hover:underline transition-colors"
            >
              <Download className="h-4 w-4" />
              Download current resume
            </a>
          )}
          <div className="flex items-center gap-3">
            <label className={[
              "flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--border)]",
              "bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-secondary)]",
              "shadow-[var(--shadow-sm)] transition-colors hover:bg-[var(--surface-raised)]",
              "hover:border-[var(--accent-soft-border)] hover:text-[var(--accent)]",
            ].join(" ")}>
              <Upload className="h-4 w-4" />
              {uploading ? "Uploading…" : "Upload PDF"}
              <input
                id="resume-upload"
                type="file"
                accept="application/pdf"
                onChange={handleResumeUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
            {uploading && <Loader2 className="h-4 w-4 animate-spin text-[var(--text-muted)]" />}
          </div>
        </CardContent>
      </Card>

      {/* Feedback */}
      {message && (
        <div className="flex items-center gap-2 text-sm text-[var(--success)] animate-fade-in">
          <CheckCircle2 className="h-4 w-4" />
          {message}
        </div>
      )}
      {error && <p className="text-sm text-[var(--danger)]">{error}</p>}

      <Button id="save-profile-btn" type="submit" disabled={saving}>
        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Profile
      </Button>
    </form>
  );
}
