"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "../../lib/supabase/client";

const roleContent = {
  shopper: {
    title: "Shopper portal",
    actions: [
      "Save delivery addresses and notes",
      "Browse fresh local listings",
      "Track active orders and delivery windows",
    ],
  },
  grower: {
    title: "Grower portal",
    actions: [
      "Update stock, prices, and seasonal listings",
      "Choose delivery, pickup, or distribution handoff",
      "Manage payout details and order fulfillment",
    ],
  },
  load_shifter: {
    title: "Load shifter portal",
    actions: [
      "Set service area and route availability",
      "Accept grower-to-shopper or hub delivery jobs",
      "Track proof of delivery and completed runs",
    ],
  },
  admin: {
    title: "Admin portal",
    actions: [
      "Review onboarding and profile approvals",
      "Monitor commissions, payouts, and disputes",
      "Manage distribution centre capacity and support",
    ],
  },
};

export default function PortalPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const supabase = getSupabaseBrowserClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          router.replace("/login");
          return;
        }

        const { data, error: profileError } = await supabase
          .from("profiles")
          .select("id, full_name, role, status, company_name")
          .eq("id", session.user.id)
          .single();

        if (profileError) {
          throw profileError;
        }

        setProfile(data);
      } catch (loadError) {
        setError(loadError.message || "Unable to load your portal.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  async function handleLogout() {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="app-shell">
        <section className="portal-page">
          <div className="portal-summary">
            <p className="auth-kicker">Portal</p>
            <h1>Loading your account...</h1>
          </div>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="app-shell">
        <section className="portal-page">
          <div className="portal-summary">
            <p className="auth-kicker">Portal</p>
            <h1>We couldn&apos;t load this portal yet.</h1>
            <p className="status-message status-error">{error}</p>
            <div className="auth-actions">
              <Link className="button button-secondary" href="/login">
                Try logging in again
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

  const currentRole = profile?.role || "shopper";
  const content = roleContent[currentRole] || roleContent.shopper;

  return (
    <main className="app-shell">
      <section className="portal-page">
        <div className="portal-header">
          <div className="portal-summary">
            <p className="auth-kicker">{content.title}</p>
            <h1>Welcome, {profile?.full_name}.</h1>
            <p className="lead">
              Your account is currently <strong>{profile?.status}</strong>. This
              is the first authenticated hub for your role-based journey through
              Lombardi&apos;s Farm to Fork.
            </p>
          </div>
          <button className="button button-outline" onClick={handleLogout} type="button">
            Log out
          </button>
        </div>

        <div className="portal-grid">
          {content.actions.map((action) => (
            <article className="portal-card" key={action}>
              <h3>{action}</h3>
              <p>
                This is ready for the next implementation pass, where we connect
                each role to real listings, orders, addresses, and delivery
                workflows in Supabase.
              </p>
              <span>Next build target</span>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
