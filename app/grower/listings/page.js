"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "../../../lib/supabase/client";

const initialFormState = {
  name: "",
  categoryId: "",
  description: "",
  unit: "",
  price: "",
  stockQuantity: "",
  minOrderQuantity: "1",
  seasonalStart: "",
  seasonalEnd: "",
  isActive: true,
};

export default function GrowerListingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [formState, setFormState] = useState(initialFormState);
  const [status, setStatus] = useState({ type: "", message: "" });

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = getSupabaseBrowserClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          router.replace("/login");
          return;
        }

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, role, full_name, status")
          .eq("id", session.user.id)
          .single();

        if (profileError) {
          throw profileError;
        }

        if (profileData.role !== "grower") {
          router.replace("/portal");
          return;
        }

        const [categoryResult, productsResult] = await Promise.all([
          supabase.from("categories").select("*").order("sort_order", { ascending: true }),
          supabase
            .from("products")
            .select("*, categories(id, name, slug)")
            .eq("grower_id", session.user.id)
            .order("created_at", { ascending: false }),
        ]);

        if (categoryResult.error) {
          throw categoryResult.error;
        }

        if (productsResult.error) {
          throw productsResult.error;
        }

        const categoryData = categoryResult.data || [];
        setProfile(profileData);
        setCategories(categoryData);
        setProducts(productsResult.data || []);
        setFormState((current) => ({
          ...current,
          categoryId: categoryData[0]?.id || "",
        }));
      } catch (error) {
        setStatus({
          type: "error",
          message: error.message || "Unable to load your listings right now.",
        });
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setFormState((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function refreshProducts() {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("products")
      .select("*, categories(id, name, slug)")
      .eq("grower_id", profile.id)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    setProducts(data || []);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setStatus({ type: "", message: "" });

    try {
      const supabase = getSupabaseBrowserClient();
      const payload = {
        grower_id: profile.id,
        name: formState.name,
        category: categories.find((category) => category.id === formState.categoryId)?.name || "Other",
        category_id: formState.categoryId,
        description: formState.description || null,
        unit: formState.unit,
        price: Number(formState.price),
        stock_quantity: Number(formState.stockQuantity || 0),
        min_order_quantity: Number(formState.minOrderQuantity || 1),
        seasonal_start: formState.seasonalStart || null,
        seasonal_end: formState.seasonalEnd || null,
        is_active: formState.isActive,
      };

      const { error } = await supabase.from("products").insert(payload);

      if (error) {
        throw error;
      }

      await refreshProducts();
      setFormState(initialFormState);
      setStatus({
        type: "success",
        message: "Listing created and ready to appear in the marketplace.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Unable to save this listing.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleProduct(productId, currentValue) {
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase
        .from("products")
        .update({ is_active: !currentValue, updated_at: new Date().toISOString() })
        .eq("id", productId);

      if (error) {
        throw error;
      }

      await refreshProducts();
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Unable to update listing status.",
      });
    }
  }

  if (loading) {
    return (
      <main className="app-shell">
        <section className="portal-page">
          <div className="portal-summary">
            <p className="auth-kicker">Grower listings</p>
            <h1>Loading your products...</h1>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <section className="portal-page">
        <div className="portal-header">
          <div className="portal-summary">
            <p className="auth-kicker">Grower listings</p>
            <h1>Manage produce for {profile?.full_name}.</h1>
            <p className="lead">
              Add your seasonal products, set stock and pricing, and control
              which listings are currently live for shoppers.
            </p>
          </div>
          <Link className="button button-outline" href="/portal">
            Back to portal
          </Link>
        </div>

        <div className="portal-grid listings-layout">
          <article className="portal-card">
            <h3>Create a new listing</h3>
            <form className="auth-grid" onSubmit={handleSubmit}>
              <div className="field-group">
                <label htmlFor="name">Product name</label>
                <input id="name" name="name" value={formState.name} onChange={handleChange} required />
              </div>

              <div className="field-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="categoryId"
                  value={formState.categoryId}
                  onChange={handleChange}
                  required
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field-group">
                <label htmlFor="unit">Unit</label>
                <input
                  id="unit"
                  name="unit"
                  value={formState.unit}
                  onChange={handleChange}
                  placeholder="kg, bunch, tray, each"
                  required
                />
              </div>

              <div className="field-group">
                <label htmlFor="price">Price</label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formState.price}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="field-group">
                <label htmlFor="stockQuantity">Stock quantity</label>
                <input
                  id="stockQuantity"
                  name="stockQuantity"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formState.stockQuantity}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="field-group">
                <label htmlFor="minOrderQuantity">Minimum order</label>
                <input
                  id="minOrderQuantity"
                  name="minOrderQuantity"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={formState.minOrderQuantity}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="field-group">
                <label htmlFor="seasonalStart">Seasonal start</label>
                <input
                  id="seasonalStart"
                  name="seasonalStart"
                  type="date"
                  value={formState.seasonalStart}
                  onChange={handleChange}
                />
              </div>

              <div className="field-group">
                <label htmlFor="seasonalEnd">Seasonal end</label>
                <input
                  id="seasonalEnd"
                  name="seasonalEnd"
                  type="date"
                  value={formState.seasonalEnd}
                  onChange={handleChange}
                />
              </div>

              <div className="field-group field-group-full">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formState.description}
                  onChange={handleChange}
                  placeholder="Harvest notes, freshness details, pack size, or pickup tips"
                />
              </div>

              <label className="toggle-card field-group-full">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formState.isActive}
                  onChange={handleChange}
                />
                <span>Make this listing live immediately</span>
              </label>

              {status.message ? (
                <p
                  className={`status-message ${
                    status.type === "error" ? "status-error" : "status-success"
                  }`}
                >
                  {status.message}
                </p>
              ) : null}

              <button className="button button-full" disabled={saving} type="submit">
                {saving ? "Saving listing..." : "Create listing"}
              </button>
            </form>
          </article>

          <article className="portal-card">
            <h3>Your current listings</h3>
            {products.length ? (
              <div className="listing-stack">
                {products.map((product) => (
                  <div className="listing-item" key={product.id}>
                    <div className="listing-header">
                      <div>
                        <strong>{product.name}</strong>
                        <p className="form-helper">
                          {product.categories?.name || product.category} · $
                          {Number(product.price).toFixed(2)} per {product.unit}
                        </p>
                      </div>
                      <button
                        className="button button-outline"
                        onClick={() => handleToggleProduct(product.id, product.is_active)}
                        type="button"
                      >
                        {product.is_active ? "Pause listing" : "Activate listing"}
                      </button>
                    </div>
                    <p className="form-helper">
                      Stock: {product.stock_quantity} · Minimum order: {product.min_order_quantity}
                    </p>
                    {product.description ? <p>{product.description}</p> : null}
                    <span>{product.is_active ? "Live in marketplace" : "Currently hidden"}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="form-helper">
                No listings yet. Add your first product to start building your marketplace presence.
              </p>
            )}
          </article>
        </div>
      </section>
    </main>
  );
}
