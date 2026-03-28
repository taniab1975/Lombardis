"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "../../lib/supabase/client";

export default function ShopPage() {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState([]);
  const [listings, setListings] = useState([]);
  const [status, setStatus] = useState({ type: "", message: "" });

  useEffect(() => {
    async function loadMarketplace() {
      try {
        const supabase = getSupabaseBrowserClient();
        const [categoryResult, listingsResult] = await Promise.all([
          supabase.from("categories").select("*").order("sort_order", { ascending: true }),
          supabase
            .from("products")
            .select(
              "id, name, description, unit, price, stock_quantity, min_order_quantity, seasonal_start, seasonal_end, category, is_active, categories(id, name, slug), profiles!products_grower_id_fkey(id, full_name, company_name, service_area)",
            )
            .eq("is_active", true)
            .gt("stock_quantity", 0)
            .order("created_at", { ascending: false }),
        ]);

        if (categoryResult.error) {
          throw categoryResult.error;
        }

        if (listingsResult.error) {
          throw listingsResult.error;
        }

        setCategories(categoryResult.data || []);
        setListings(listingsResult.data || []);
      } catch (error) {
        setStatus({
          type: "error",
          message: error.message || "Unable to load marketplace listings right now.",
        });
      } finally {
        setLoading(false);
      }
    }

    loadMarketplace();
  }, []);

  const filteredListings = listings.filter((listing) => {
    const matchesSearch =
      !searchTerm ||
      [listing.name, listing.description, listing.category]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      selectedCategory === "all" || listing.categories?.slug === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <main className="app-shell">
      <section className="portal-page">
        <div className="portal-header">
          <div className="portal-summary">
            <p className="auth-kicker">Marketplace search</p>
            <h1>Compare fresh produce from every grower.</h1>
            <p className="lead">
              Search for nectarines, eggs, herbs, or whatever you need and see
              listings from all registered suppliers in one place.
            </p>
          </div>
          <Link className="button button-outline" href="/">
            Back home
          </Link>
        </div>

        <div className="portal-card search-toolbar">
          <div className="field-group">
            <label htmlFor="searchTerm">Search products</label>
            <input
              id="searchTerm"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Try nectarines, lamb, basil, eggs"
            />
          </div>

          <div className="field-group">
            <label htmlFor="categoryFilter">Category</label>
            <select
              id="categoryFilter"
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
            >
              <option value="all">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
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

        {loading ? (
          <div className="portal-summary">
            <h2>Loading listings...</h2>
          </div>
        ) : (
          <div className="market-grid">
            {filteredListings.length ? (
              filteredListings.map((listing) => (
                <article className="portal-card market-card" key={listing.id}>
                  <p className="entry-kicker">{listing.categories?.name || listing.category}</p>
                  <h3>{listing.name}</h3>
                  <p className="form-helper">
                    {listing.profiles?.company_name ||
                      listing.profiles?.full_name ||
                      "Local grower"}
                    {listing.profiles?.service_area
                      ? ` · ${listing.profiles.service_area}`
                      : ""}
                  </p>
                  <p>
                    ${Number(listing.price).toFixed(2)} per {listing.unit}
                  </p>
                  <p className="form-helper">
                    Stock: {listing.stock_quantity} · Minimum order:{" "}
                    {listing.min_order_quantity}
                  </p>
                  {listing.description ? <p>{listing.description}</p> : null}
                  <span>Compare with other growers</span>
                </article>
              ))
            ) : (
              <div className="portal-summary">
                <h2>No matches yet</h2>
                <p className="form-helper">
                  Try a broader term or switch categories to see more produce
                  from across the marketplace.
                </p>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
