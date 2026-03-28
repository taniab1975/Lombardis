"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "../../lib/supabase/client";
import { getCompletionState, getRoleLabel } from "../../lib/profile-completion";
import AddressFields from "./address-fields";

const initialState = {
  fullName: "",
  phone: "",
  companyName: "",
  abn: "",
  bio: "",
  serviceArea: "",
  farmName: "",
  shortDescription: "",
  seasonalNotes: "",
  coldChainRequired: false,
  offersDirectDelivery: false,
  offersPickup: true,
  offersDistributionDropoff: false,
  vehicleType: "",
  refrigerated: false,
  maxLoadKg: "",
  availabilityNotes: "",
  addressLine1: "",
  addressLine2: "",
  suburb: "",
  state: "",
  postcode: "",
  countryCode: "AU",
  deliveryNotes: "",
  formattedAddress: "",
  latitude: null,
  longitude: null,
  placeId: "",
  validationProvider: "manual_pending_autocomplete",
  validationStatus: "pending",
};

function buildFormattedAddress(formState) {
  return [
    formState.addressLine1,
    formState.addressLine2,
    formState.suburb,
    formState.state,
    formState.postcode,
    formState.countryCode,
  ]
    .filter(Boolean)
    .join(", ");
}

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [sessionUserId, setSessionUserId] = useState(null);
  const [role, setRole] = useState("shopper");
  const [addressId, setAddressId] = useState(null);
  const [formState, setFormState] = useState(initialState);
  const [checklist, setChecklist] = useState([]);

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

        setSessionUserId(session.user.id);

        const [
          profileResult,
          addressResult,
          growerResult,
          loadShifterResult,
        ] = await Promise.all([
          supabase
            .from("profiles")
            .select("id, role, full_name, phone, company_name, abn, bio, service_area, status")
            .eq("id", session.user.id)
            .single(),
          supabase
            .from("addresses")
            .select("*")
            .eq("profile_id", session.user.id)
            .in("type", ["delivery", "farm"])
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
          supabase
            .from("grower_profiles")
            .select("*")
            .eq("profile_id", session.user.id)
            .maybeSingle(),
          supabase
            .from("load_shifter_profiles")
            .select("*")
            .eq("profile_id", session.user.id)
            .maybeSingle(),
        ]);

        if (profileResult.error) {
          throw profileResult.error;
        }

        const profile = profileResult.data;
        const primaryAddress = addressResult.data;
        const growerProfile = growerResult.data;
        const loadShifterProfile = loadShifterResult.data;

        setRole(profile.role);
        setAddressId(primaryAddress?.id || null);
        setFormState({
          fullName: profile.full_name || "",
          phone: profile.phone || "",
          companyName: profile.company_name || "",
          abn: profile.abn || "",
          bio: profile.bio || "",
          serviceArea: profile.service_area || "",
          farmName: growerProfile?.farm_name || "",
          shortDescription: growerProfile?.short_description || "",
          seasonalNotes: growerProfile?.seasonal_notes || "",
          coldChainRequired: growerProfile?.cold_chain_required || false,
          offersDirectDelivery: growerProfile?.offers_direct_delivery || false,
          offersPickup:
            typeof growerProfile?.offers_pickup === "boolean"
              ? growerProfile.offers_pickup
              : true,
          offersDistributionDropoff:
            growerProfile?.offers_distribution_dropoff || false,
          vehicleType: loadShifterProfile?.vehicle_type || "",
          refrigerated: loadShifterProfile?.refrigerated || false,
          maxLoadKg:
            loadShifterProfile?.max_load_kg !== null &&
            loadShifterProfile?.max_load_kg !== undefined
              ? String(loadShifterProfile.max_load_kg)
              : "",
          availabilityNotes: loadShifterProfile?.availability_notes || "",
          addressLine1: primaryAddress?.address_line_1 || "",
          addressLine2: primaryAddress?.address_line_2 || "",
          suburb: primaryAddress?.suburb || "",
          state: primaryAddress?.state || "",
          postcode: primaryAddress?.postcode || "",
          countryCode: primaryAddress?.country_code || "AU",
          deliveryNotes: primaryAddress?.delivery_notes || "",
          formattedAddress: primaryAddress?.formatted_address || "",
          latitude: primaryAddress?.latitude ?? null,
          longitude: primaryAddress?.longitude ?? null,
          placeId: primaryAddress?.place_id || "",
          validationProvider:
            primaryAddress?.validation_provider || "manual_pending_autocomplete",
          validationStatus: primaryAddress?.validation_status || "pending",
        });

        const completion = getCompletionState({
          profile,
          primaryAddress,
          growerProfile,
          loadShifterProfile,
        });
        setChecklist(completion.checklist);
      } catch (error) {
        setStatus({
          type: "error",
          message: error.message || "Unable to load onboarding right now.",
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

  function handleAddressSelect(addressData) {
    setFormState((current) => ({
      ...current,
      addressLine1: addressData.addressLine1 || current.addressLine1,
      suburb: addressData.suburb || current.suburb,
      state: addressData.state || current.state,
      postcode: addressData.postcode || current.postcode,
      countryCode: addressData.countryCode || current.countryCode,
      formattedAddress: addressData.formattedAddress || current.formattedAddress,
      latitude: addressData.latitude,
      longitude: addressData.longitude,
      placeId: addressData.placeId || current.placeId,
      validationProvider: addressData.validationProvider || current.validationProvider,
      validationStatus: addressData.validationStatus || current.validationStatus,
    }));
  }

  async function upsertAddress(supabase) {
    const needsAddress = role === "shopper" || role === "grower";

    if (!needsAddress) {
      return null;
    }

    const addressPayload = {
      profile_id: sessionUserId,
      type: role === "grower" ? "farm" : "delivery",
      label: role === "grower" ? "Primary farm" : "Primary delivery",
      address_line_1: formState.addressLine1,
      address_line_2: formState.addressLine2 || null,
      suburb: formState.suburb,
      state: formState.state,
      postcode: formState.postcode,
      country_code: formState.countryCode || "AU",
      formatted_address: formState.formattedAddress || buildFormattedAddress(formState),
      latitude: formState.latitude,
      longitude: formState.longitude,
      delivery_notes: formState.deliveryNotes || null,
      place_id: formState.placeId || null,
      is_default: true,
      validation_provider: formState.validationProvider || "manual_pending_autocomplete",
      validation_status: formState.validationStatus || "pending",
    };

    if (addressId) {
      const { error } = await supabase.from("addresses").update(addressPayload).eq("id", addressId);
      if (error) {
        throw error;
      }
      return addressId;
    }

    const { data, error } = await supabase
      .from("addresses")
      .insert(addressPayload)
      .select("id")
      .single();

    if (error) {
      throw error;
    }

    return data.id;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setStatus({ type: "", message: "" });

    try {
      const supabase = getSupabaseBrowserClient();
      const profileStatus = role === "shopper" ? "active" : "pending";

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: formState.fullName,
          phone: formState.phone,
          company_name: formState.companyName || null,
          abn: formState.abn || null,
          bio: formState.bio || null,
          service_area: formState.serviceArea || null,
          status: profileStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", sessionUserId);

      if (profileError) {
        throw profileError;
      }

      await upsertAddress(supabase);

      if (role === "grower") {
        const { error } = await supabase.from("grower_profiles").upsert(
          {
            profile_id: sessionUserId,
            farm_name: formState.farmName,
            short_description: formState.shortDescription || null,
            seasonal_notes: formState.seasonalNotes || null,
            cold_chain_required: formState.coldChainRequired,
            offers_direct_delivery: formState.offersDirectDelivery,
            offers_pickup: formState.offersPickup,
            offers_distribution_dropoff: formState.offersDistributionDropoff,
          },
          { onConflict: "profile_id" },
        );

        if (error) {
          throw error;
        }
      }

      if (role === "load_shifter") {
        const { error } = await supabase.from("load_shifter_profiles").upsert(
          {
            profile_id: sessionUserId,
            vehicle_type: formState.vehicleType,
            refrigerated: formState.refrigerated,
            max_load_kg: formState.maxLoadKg ? Number(formState.maxLoadKg) : null,
            availability_notes: formState.availabilityNotes || null,
          },
          { onConflict: "profile_id" },
        );

        if (error) {
          throw error;
        }
      }

      setStatus({
        type: "success",
        message:
          role === "shopper"
            ? "Onboarding saved. Your shopper profile is ready to use."
            : "Onboarding saved. Your profile is ready for review and the next setup stage.",
      });

      router.push("/portal");
      router.refresh();
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "We couldn't save your onboarding details.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="app-shell">
        <section className="auth-page">
          <div className="auth-card">
            <p className="auth-kicker">Onboarding</p>
            <h1>Loading your setup form...</h1>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <section className="auth-page">
        <div className="auth-card onboarding-card">
          <p className="auth-kicker">{getRoleLabel(role)} onboarding</p>
          <h1>Complete the details that make your account usable.</h1>
          <p className="lead">
            We&apos;re collecting the essentials for your role first, including
            structured address capture that is ready for autocomplete and
            validation.
          </p>

          {checklist.length ? (
            <div className="checklist">
              {checklist.map((item) => (
                <div className="checklist-item" key={item.label}>
                  <strong>{item.label}</strong>
                  <span>{item.done ? "Done" : "Needed"}</span>
                </div>
              ))}
            </div>
          ) : null}

          <form className="auth-grid" onSubmit={handleSubmit}>
            <div className="section-label">Core profile</div>
            <div className="field-group">
              <label htmlFor="fullName">Full name</label>
              <input
                id="fullName"
                name="fullName"
                value={formState.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field-group">
              <label htmlFor="phone">Phone</label>
              <input
                id="phone"
                name="phone"
                value={formState.phone}
                onChange={handleChange}
                placeholder="+61 ..."
                required
              />
            </div>

            {(role === "grower" || role === "load_shifter") && (
              <>
                <div className="field-group">
                  <label htmlFor="companyName">Business name</label>
                  <input
                    id="companyName"
                    name="companyName"
                    value={formState.companyName}
                    onChange={handleChange}
                    required={role === "grower"}
                  />
                </div>

                <div className="field-group">
                  <label htmlFor="serviceArea">Service area</label>
                  <input
                    id="serviceArea"
                    name="serviceArea"
                    value={formState.serviceArea}
                    onChange={handleChange}
                    placeholder="Perth Hills, Swan Valley, South West"
                    required={role === "load_shifter"}
                  />
                </div>
              </>
            )}

            {role === "grower" && (
              <>
                <div className="section-label">Grower details</div>
                <div className="field-group">
                  <label htmlFor="farmName">Farm name</label>
                  <input
                    id="farmName"
                    name="farmName"
                    value={formState.farmName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="field-group">
                  <label htmlFor="abn">ABN</label>
                  <input
                    id="abn"
                    name="abn"
                    value={formState.abn}
                    onChange={handleChange}
                  />
                </div>

                <div className="field-group field-group-full">
                  <label htmlFor="shortDescription">Short description</label>
                  <textarea
                    id="shortDescription"
                    name="shortDescription"
                    value={formState.shortDescription}
                    onChange={handleChange}
                    placeholder="What do you grow and what makes your operation special?"
                  />
                </div>

                <div className="field-group field-group-full">
                  <label htmlFor="seasonalNotes">Seasonal notes</label>
                  <textarea
                    id="seasonalNotes"
                    name="seasonalNotes"
                    value={formState.seasonalNotes}
                    onChange={handleChange}
                    placeholder="Harvest windows, order cutoffs, local conditions"
                  />
                </div>

                <div className="toggle-grid">
                  <label className="toggle-card">
                    <input
                      type="checkbox"
                      name="coldChainRequired"
                      checked={formState.coldChainRequired}
                      onChange={handleChange}
                    />
                    <span>Cold chain required</span>
                  </label>
                  <label className="toggle-card">
                    <input
                      type="checkbox"
                      name="offersDirectDelivery"
                      checked={formState.offersDirectDelivery}
                      onChange={handleChange}
                    />
                    <span>Offers direct delivery</span>
                  </label>
                  <label className="toggle-card">
                    <input
                      type="checkbox"
                      name="offersPickup"
                      checked={formState.offersPickup}
                      onChange={handleChange}
                    />
                    <span>Offers pickup</span>
                  </label>
                  <label className="toggle-card">
                    <input
                      type="checkbox"
                      name="offersDistributionDropoff"
                      checked={formState.offersDistributionDropoff}
                      onChange={handleChange}
                    />
                    <span>Uses distribution drop-off</span>
                  </label>
                </div>

              </>
            )}

            {(role === "shopper" || role === "grower") && (
              <AddressFields
                formState={formState}
                onAddressSelect={handleAddressSelect}
                onFieldChange={handleChange}
                role={role}
              />
            )}

            {role === "load_shifter" && (
              <>
                <div className="section-label">Vehicle and availability</div>
                <div className="field-group">
                  <label htmlFor="vehicleType">Vehicle type</label>
                  <input
                    id="vehicleType"
                    name="vehicleType"
                    value={formState.vehicleType}
                    onChange={handleChange}
                    placeholder="Van, ute, refrigerated truck"
                    required
                  />
                </div>

                <div className="field-group">
                  <label htmlFor="maxLoadKg">Maximum load (kg)</label>
                  <input
                    id="maxLoadKg"
                    name="maxLoadKg"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formState.maxLoadKg}
                    onChange={handleChange}
                  />
                </div>

                <label className="toggle-card">
                  <input
                    type="checkbox"
                    name="refrigerated"
                    checked={formState.refrigerated}
                    onChange={handleChange}
                  />
                  <span>Refrigerated capability</span>
                </label>

                <div className="field-group field-group-full">
                  <label htmlFor="availabilityNotes">Availability notes</label>
                  <textarea
                    id="availabilityNotes"
                    name="availabilityNotes"
                    value={formState.availabilityNotes}
                    onChange={handleChange}
                    placeholder="Days, route rhythm, delivery windows"
                  />
                </div>
              </>
            )}

            <div className="field-group field-group-full">
              <label htmlFor="bio">Public bio</label>
              <textarea
                id="bio"
                name="bio"
                value={formState.bio}
                onChange={handleChange}
                placeholder="A short intro for your marketplace profile"
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

            <button className="button button-full" disabled={submitting} type="submit">
              {submitting ? "Saving..." : "Save onboarding"}
            </button>
          </form>

          <div className="auth-actions">
            <Link className="button button-secondary" href="/portal">
              Back to portal
            </Link>
            <Link className="button button-outline" href="/">
              Home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
