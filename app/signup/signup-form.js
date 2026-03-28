"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "../../lib/supabase/client";

const roleOptions = [
  { value: "shopper", label: "Shopper" },
  { value: "grower", label: "Grower" },
  { value: "load_shifter", label: "Load Shifter" },
];

export default function SignupForm({ initialRole }) {
  const router = useRouter();
  const [formState, setFormState] = useState({
    fullName: "",
    email: "",
    password: "",
    role: initialRole,
  });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormState((current) => ({ ...current, role: initialRole }));
  }, [initialRole]);

  const roleLabel =
    roleOptions.find((option) => option.value === formState.role)?.label || "Shopper";

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
      const { data, error } = await supabase.auth.signUp({
        email: formState.email,
        password: formState.password,
        options: {
          data: {
            full_name: formState.fullName,
            role: formState.role,
          },
        },
      });

      if (error) {
        throw error;
      }

      if (data.session) {
        router.push("/onboarding");
        router.refresh();
        return;
      }

      setStatus({
        type: "success",
        message:
          "Account created. If email confirmation is enabled in Supabase, check your inbox before logging in, then return here to complete onboarding.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Something went wrong while creating your account.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="app-shell">
      <section className="auth-page">
        <div className="auth-card">
          <p className="auth-kicker">Create account</p>
          <h1>Join the marketplace as a {roleLabel}.</h1>
          <p className="lead">
            Start with web-based onboarding now, then grow into dashboard and
            mobile flows as Lombardi&apos;s Farm to Fork expands.
          </p>

          <form className="auth-grid" onSubmit={handleSubmit}>
            <div className="field-group">
              <label htmlFor="fullName">Full name</label>
              <input
                id="fullName"
                name="fullName"
                value={formState.fullName}
                onChange={handleChange}
                placeholder="Your name"
                required
              />
            </div>

            <div className="field-group">
              <label htmlFor="role">I am joining as</label>
              <select id="role" name="role" value={formState.role} onChange={handleChange}>
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

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
                placeholder="At least 6 characters"
                minLength={6}
                required
              />
            </div>

            {status.message ? (
              <p
                className={`status-message ${
                  status.type === "error" ? "status-error" : "status-success"
                }`}
              >
                {status.message}
              </p>
            ) : null}

            <button className="button button-full" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Creating account..." : "Create account"}
            </button>
          </form>

          <div className="auth-actions">
            <Link className="button button-secondary" href="/login">
              Already have an account?
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
