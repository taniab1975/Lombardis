"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "../../lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [formState, setFormState] = useState({ email: "", password: "" });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormState((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: "", message: "" });

    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: formState.email,
        password: formState.password,
      });

      if (error) {
        throw error;
      }

      router.push("/portal");
      router.refresh();
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Unable to log in with those details.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="app-shell">
      <section className="auth-page">
        <div className="auth-card">
          <p className="auth-kicker">Welcome back</p>
          <h1>Log in to your Farm to Fork portal.</h1>
          <p className="lead">
            Use the same email and password you created in Supabase-backed
            signup. Admin access can stay invite-only while the marketplace
            launches.
          </p>

          <form className="auth-grid" onSubmit={handleSubmit}>
            <div className="field-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formState.email}
                onChange={handleChange}
                placeholder="name@example.com"
                required
              />
            </div>

            <div className="field-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                value={formState.password}
                onChange={handleChange}
                placeholder="Your password"
                required
              />
            </div>

            {status.message ? (
              <p className="status-message status-error">{status.message}</p>
            ) : null}

            <button className="button button-full" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Logging in..." : "Log in"}
            </button>
          </form>

          <div className="auth-actions">
            <Link className="button button-secondary" href="/signup">
              Need an account?
            </Link>
            <Link className="button button-outline" href="/">
              Back to landing page
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
