"use client";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";

export default function ClientAccessPage() {
  const [accessKey, setAccessKey] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleChange(e: any) {
    setAccessKey(e.target.value);
    setError("");
  }

  async function handleSubmit(e: any) {
    e.preventDefault();
    setSubmitted(true);
    setError("");
    if (!accessKey.trim()) {
      setError("Access key is required.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/client/access-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ accessKey })
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Login failed');
      }
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err?.toString() || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md p-8 space-y-6">
        <Skeleton className="h-7 w-2/3 mb-4 mx-auto" />
        <Skeleton className="h-10 w-full mb-3" />
        <Skeleton className="h-10 w-full mb-3" />
        <Skeleton className="h-6 w-1/2 mx-auto" />
      </Card>
    </div>
  );
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md p-8 space-y-6 shadow-lg">
      <h1 className="text-2xl font-bold text-center mb-2">Access Key Login</h1>
      <p className="text-center text-muted-foreground mb-4">
        Enter the access key provided by your dietitian.<br />
        <span className="text-xs text-muted-foreground">
          If you don&apos;t have a key, please contact your dietitian.
        </span>
      </p>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input label="Access Key" name="accessKey" value={accessKey} onChange={handleChange} required error={submitted && error ? error : ''} />
        <Button type="submit" className="w-full mt-2" disabled={loading}>
          {loading ? 'Processing...' : 'Continue'}
        </Button>
      </form>
      {error && (
        <div className="flex flex-col items-center text-danger mt-4">
          <span className="text-3xl mb-2">❌</span>
          <div className="font-semibold mb-1">{error}</div>
          <div className="text-sm">Please check your key and try again.</div>
        </div>
      )}
      <div className="text-center text-sm mt-4">
        <a href="/auth/login" className="text-primary hover:underline font-medium">Dietitian Login</a>
      </div>
      </Card>
    </div>
  );
}
