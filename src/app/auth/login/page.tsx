"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card animate-fade-in">
      <h2 className="text-xl font-semibold mb-6">Sign in to your account</h2>
      {error && (
        <div className="mb-4 rounded-lg bg-red-900/30 border border-red-800 p-3 text-sm text-red-400">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" required placeholder="you@example.com" />
        </div>
        <div>
          <label className="label">Password</label>
          <div className="relative">
            <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="input-field pr-10" required placeholder="••••••••" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? <Loader2 size={18} className="animate-spin" /> : "Sign In"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-surface-400">
        Don&apos;t have an account?{" "}
        <Link href="/auth/register" className="text-brand-400 hover:text-brand-300 font-medium">Sign up</Link>
      </p>
    </div>
  );
}