import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEmployerProfile, updateEmployerProfile } from "@/api/api";
import { Loader2, CheckCircle2, Building2 } from "lucide-react";

function SkeletonForm() {
  return (
    <Card className="max-w-lg">
      <CardContent className="p-5 space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="skeleton h-3 w-20 rounded-md" />
            <div className="skeleton h-9 w-full rounded-lg" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function CompanyProfile() {
  const { getToken } = useAuth();
  const [form, setForm] = useState({
    companyName: "",
    logo: "",
    description: "",
    category: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    getEmployerProfile(getToken)
      .then((p) =>
        setForm({
          companyName: p.companyName ?? "",
          logo: p.logo ?? "",
          description: p.description ?? "",
          category: p.category ?? "",
        })
      )
      .catch((e) => {
        if (e.status !== 404) setError(e.message);
      })
      .finally(() => setLoading(false));
  }, [getToken]);

  function setField(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      await updateEmployerProfile(getToken, form);
      setMessage("Company profile saved.");
      setTimeout(() => setMessage(""), 3000);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <SkeletonForm />;

  return (
    <div className="max-w-lg space-y-4 animate-fade-in-up">
      {/* Header preview */}
      <div className="flex items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)]">
        {form.logo ? (
          <img
            src={form.logo}
            alt="Logo preview"
            className="h-14 w-14 rounded-xl border border-[var(--border)] object-contain bg-[var(--surface-raised)]"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--accent-soft)] border border-[var(--accent-soft-border)]">
            <Building2 className="h-7 w-7 text-[var(--accent)]" />
          </div>
        )}
        <div>
          <p className="text-base font-semibold text-[var(--text-primary)]">
            {form.companyName || "Your Company"}
          </p>
          {form.category && (
            <p className="text-sm text-[var(--text-muted)]">{form.category}</p>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="cp-name">Company Name</Label>
              <Input
                id="cp-name"
                name="companyName"
                value={form.companyName}
                onChange={setField}
                placeholder="Acme Corp"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cp-logo">Logo URL</Label>
              <Input
                id="cp-logo"
                name="logo"
                value={form.logo}
                onChange={setField}
                placeholder="https://…"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cp-category">Category</Label>
              <Input
                id="cp-category"
                name="category"
                value={form.category}
                onChange={setField}
                placeholder="Technology"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cp-description">Description</Label>
              <Textarea
                id="cp-description"
                name="description"
                value={form.description}
                onChange={setField}
                rows={4}
                placeholder="Tell applicants about your company…"
              />
            </div>

            {message && (
              <div className="flex items-center gap-2 text-sm text-[var(--success)] animate-fade-in">
                <CheckCircle2 className="h-4 w-4" />
                {message}
              </div>
            )}
            {error && <p className="text-sm text-[var(--danger)]">{error}</p>}

            <Button id="save-company-btn" type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Profile
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
