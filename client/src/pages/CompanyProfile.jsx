import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEmployerProfile, updateEmployerProfile } from "@/api/api";
import { Loader2, CheckCircle2 } from "lucide-react";

function SkeletonForm() {
  return (
    <Card className="max-w-lg">
      <CardContent className="p-5 space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="skeleton h-3 w-20" />
            <div className="skeleton h-9 w-full" />
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
    <Card className="max-w-lg animate-slide-up">
      <CardHeader>
        <CardTitle className="text-base">Company Information</CardTitle>
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
            {form.logo && (
              <div className="mt-2 flex items-center gap-3">
                <img
                  src={form.logo}
                  alt="Logo preview"
                  className="h-10 w-10 rounded-[8px] border border-[var(--border)] object-contain"
                />
                <span className="text-xs text-[var(--text-muted)]">
                  Preview
                </span>
              </div>
            )}
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
            <div className="flex items-center gap-2 text-sm text-emerald-600">
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
  );
}
