import Link from "next/link";

const entryPoints = [
  {
    role: "shopper",
    title: "Buy local food with confidence",
    description:
      "Save delivery details, browse seasonal listings, and track orders from farm gate to front door.",
  },
  {
    role: "grower",
    title: "Manage stock and seasonal listings",
    description:
      "Set pricing, update availability, and choose direct delivery, pickup, or distribution drop-off.",
  },
  {
    role: "load_shifter",
    title: "Offer transport where it matters most",
    description:
      "Publish service areas, vehicle type, and route capacity so fresh local food keeps moving.",
  },
  {
    role: "admin",
    title: "Oversee approvals, payments, and support",
    description:
      "Monitor onboarding, commissions, payouts, disputes, and optional distribution-centre operations.",
  },
];

export default function HomePage() {
  return (
    <main>
      <header className="hero">
        <nav className="topbar">
          <Link className="brand" href="/">
            Lombardi&apos;s Farm to Fork
          </Link>
          <div className="topbar-links">
            <a href="#how-it-works">How It Works</a>
            <a href="#entry-points">Who It&apos;s For</a>
            <a href="#future">App Roadmap</a>
            <Link className="button button-outline" href="/login">
              Log In
            </Link>
          </div>
        </nav>

        <section className="hero-content">
          <div className="hero-copy">
            <p className="eyebrow">Local food. Fewer middlemen. Fairer returns.</p>
            <h1>From paddock to plate, without the supermarket squeeze.</h1>
            <p className="lead">
              Lombardi&apos;s Farm to Fork is a local food marketplace connecting
              shoppers directly with growers and transporters, cutting food
              miles, reducing supermarket markups, and putting more money back
              in farmers&apos; pockets.
            </p>
            <div className="hero-actions">
              <a className="button" href="#entry-points">
                Choose Your Path
              </a>
              <Link className="button button-secondary" href="/signup">
                Join The Marketplace
              </Link>
            </div>
            <ul className="hero-points">
              <li>Fresher local produce and proteins</li>
              <li>Flexible delivery: direct, pickup, or via a hub</li>
              <li>Built for web first, then iPhone and Android</li>
            </ul>
          </div>

          <aside className="hero-panel">
            <p className="panel-title">What shoppers get</p>
            <h2>Fresh food with a clearer story.</h2>
            <p>
              See who grew it, where it came from, how it gets to you, and why
              your dollars go further for local families and local farms.
            </p>

            <div className="route-card">
              <span>1</span>
              <div>
                <strong>Grower lists produce</strong>
                <p>Seasonal stock, harvest windows, and pickup options.</p>
              </div>
            </div>
            <div className="route-card">
              <span>2</span>
              <div>
                <strong>Shopper places an order</strong>
                <p>Choose direct delivery, a hub handoff, or collection.</p>
              </div>
            </div>
            <div className="route-card">
              <span>3</span>
              <div>
                <strong>Load shifter moves the order</strong>
                <p>Keep local food moving where and when it is needed.</p>
              </div>
            </div>
          </aside>
        </section>
      </header>

      <section className="section benefits">
        <div className="section-heading">
          <p className="eyebrow">Why this matters</p>
          <h2>Better for families. Better for farmers. Better for food miles.</h2>
        </div>
        <div className="benefit-grid">
          <article>
            <h3>For shoppers</h3>
            <p>
              Access fresher paddock-to-plate food, clearer provenance, and
              fairer prices than the major supermarket chain model.
            </p>
          </article>
          <article>
            <h3>For growers</h3>
            <p>
              Control your own listings, seasonal availability, and pricing
              while keeping more value in your business.
            </p>
          </article>
          <article>
            <h3>For local delivery</h3>
            <p>
              Create a flexible logistics layer where transporters can connect
              supply to demand without wasteful long-distance handling.
            </p>
          </article>
        </div>
      </section>

      <section className="section flow" id="how-it-works">
        <div className="section-heading">
          <p className="eyebrow">How it works</p>
          <h2>One marketplace, four ways in.</h2>
        </div>
        <div className="flow-grid">
          <article>
            <h3>Shop</h3>
            <p>
              Browse seasonal listings, compare growers, confirm your address,
              and choose a delivery method that suits your location.
            </p>
          </article>
          <article>
            <h3>List</h3>
            <p>
              Growers add products, update stock, set harvest windows, and pick
              the fulfillment method for each order.
            </p>
          </article>
          <article>
            <h3>Move</h3>
            <p>
              Load shifters accept jobs based on route, availability, and
              vehicle type, including refrigerated capability where needed.
            </p>
          </article>
          <article>
            <h3>Coordinate</h3>
            <p>
              Lombardi&apos;s Farm to Fork tracks commissions, payout flows, and
              optional short-stay hub handling for consolidated deliveries.
            </p>
          </article>
        </div>
      </section>

      <section className="section entry-points" id="entry-points">
        <div className="section-heading">
          <p className="eyebrow">Choose your entry point</p>
          <h2>Designed for the people who make the marketplace work.</h2>
        </div>
        <div className="entry-grid">
          {entryPoints.map((entry) => (
            <Link
              key={entry.role}
              className="entry-card"
              href={entry.role === "admin" ? "/login" : `/signup?role=${entry.role}`}
            >
              <p className="entry-kicker">
                {entry.role === "load_shifter"
                  ? "Load Shifter"
                  : entry.role.charAt(0).toUpperCase() + entry.role.slice(1)}
              </p>
              <h3>{entry.title}</h3>
              <p>{entry.description}</p>
              <span>
                {entry.role === "admin" ? "Admin sign in" : `Join as ${entry.role}`}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section detail-grid">
        <article className="detail-card">
          <h3>Shopper experience</h3>
          <p>
            Address autocomplete and validation, saved household preferences,
            delivery notes, and mobile-friendly ordering for repeat purchases.
          </p>
        </article>
        <article className="detail-card">
          <h3>Grower experience</h3>
          <p>
            Product management, stock tracking, harvest windows, compliance
            docs, payout settings, and order fulfillment controls.
          </p>
        </article>
        <article className="detail-card">
          <h3>Load shifter experience</h3>
          <p>
            Available routes, vehicle capability, direct-to-customer jobs, and
            grower-to-hub handoffs with clear pickup and drop instructions.
          </p>
        </article>
        <article className="detail-card">
          <h3>Admin experience</h3>
          <p>
            Role approvals, commissions, payouts, temporary hub intake, issue
            resolution, and reporting for local growth.
          </p>
        </article>
      </section>

      <section className="section future" id="future">
        <div className="section-heading">
          <p className="eyebrow">App-ready roadmap</p>
          <h2>Start on the web, scale into mobile once the flows are proven.</h2>
        </div>
        <div className="future-grid">
          <article>
            <h3>Phase 1</h3>
            <p>Responsive web landing page and role-based portals.</p>
          </article>
          <article>
            <h3>Phase 2</h3>
            <p>Supabase-backed authentication, listings, orders, and payouts.</p>
          </article>
          <article>
            <h3>Phase 3</h3>
            <p>Shared codebase expansion into iPhone and Android apps.</p>
          </article>
        </div>
      </section>

      <footer className="footer">
        <div>
          <p className="footer-brand">Lombardi&apos;s Farm to Fork</p>
          <p>Fresher food, lower food miles, and fairer returns for growers.</p>
        </div>
        <div className="footer-links">
          <a href="#entry-points">Entry Points</a>
          <Link href="/signup">Create account</Link>
          <Link href="/login">Log in</Link>
        </div>
      </footer>
    </main>
  );
}
