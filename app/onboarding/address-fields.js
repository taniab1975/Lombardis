"use client";

import Script from "next/script";
import { useEffect, useId, useRef, useState } from "react";

function extractComponent(components, type, mode = "long_name") {
  return components.find((component) => component.types.includes(type))?.[mode] || "";
}

function buildAddressFromPlace(place) {
  const components = place.address_components || [];
  const streetNumber = extractComponent(components, "street_number");
  const route = extractComponent(components, "route");
  const suburb =
    extractComponent(components, "locality") ||
    extractComponent(components, "postal_town") ||
    extractComponent(components, "sublocality_level_1");
  const state = extractComponent(components, "administrative_area_level_1", "short_name");
  const postcode = extractComponent(components, "postal_code");
  const countryCode = extractComponent(components, "country", "short_name") || "AU";

  return {
    addressLine1: [streetNumber, route].filter(Boolean).join(" "),
    suburb,
    state,
    postcode,
    countryCode,
    formattedAddress: place.formatted_address || "",
    placeId: place.place_id || "",
    latitude: place.geometry?.location?.lat?.() ?? null,
    longitude: place.geometry?.location?.lng?.() ?? null,
    validationProvider: "google_places",
    validationStatus: "selected",
  };
}

export default function AddressFields({
  role,
  formState,
  onFieldChange,
  onAddressSelect,
}) {
  const searchId = useId();
  const searchInputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [mapsReady, setMapsReady] = useState(false);
  const mapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!mapsApiKey || !mapsReady || !searchInputRef.current || autocompleteRef.current) {
      return;
    }

    if (!window.google?.maps?.places?.Autocomplete) {
      return;
    }

    const autocomplete = new window.google.maps.places.Autocomplete(searchInputRef.current, {
      fields: ["address_components", "formatted_address", "geometry", "place_id"],
      componentRestrictions: { country: formState.countryCode?.toLowerCase() || "au" },
      types: ["address"],
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place?.address_components?.length) {
        return;
      }

      onAddressSelect(buildAddressFromPlace(place));
    });

    autocompleteRef.current = autocomplete;
  }, [formState.countryCode, mapsApiKey, mapsReady, onAddressSelect]);

  const addressLabel = role === "grower" ? "Farm address" : "Delivery address";
  const notesLabel = role === "grower" ? "Farm access notes" : "Delivery notes";
  const hasAutocomplete = Boolean(mapsApiKey);

  return (
    <>
      {hasAutocomplete ? (
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${mapsApiKey}&libraries=places`}
          strategy="afterInteractive"
          onLoad={() => setMapsReady(true)}
        />
      ) : null}

      <div className="section-label">{addressLabel}</div>

      <div className="field-group field-group-full">
        <label htmlFor={searchId}>Search address</label>
        <input
          id={searchId}
          ref={searchInputRef}
          defaultValue={formState.formattedAddress || ""}
          placeholder={
            hasAutocomplete
              ? "Start typing an address for suggestions"
              : "Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to enable autocomplete"
          }
        />
        <p className="form-helper">
          {hasAutocomplete
            ? "Choose a suggested address to prefill the fields below. Rural and farm access details can still be added manually."
            : "Autocomplete is not enabled yet, so the fields below are in manual mode for now."}
        </p>
      </div>

      <div className="field-group field-group-full">
        <label htmlFor="addressLine1">Address line 1</label>
        <input
          id="addressLine1"
          name="addressLine1"
          value={formState.addressLine1}
          onChange={onFieldChange}
          required
        />
      </div>

      <div className="field-group field-group-full">
        <label htmlFor="addressLine2">Address line 2</label>
        <input
          id="addressLine2"
          name="addressLine2"
          value={formState.addressLine2}
          onChange={onFieldChange}
          placeholder="Unit, gate, shed, or landmark"
        />
      </div>

      <div className="field-group">
        <label htmlFor="suburb">Suburb</label>
        <input id="suburb" name="suburb" value={formState.suburb} onChange={onFieldChange} required />
      </div>

      <div className="field-group">
        <label htmlFor="state">State</label>
        <input id="state" name="state" value={formState.state} onChange={onFieldChange} required />
      </div>

      <div className="field-group">
        <label htmlFor="postcode">Postcode</label>
        <input
          id="postcode"
          name="postcode"
          value={formState.postcode}
          onChange={onFieldChange}
          required
        />
      </div>

      <div className="field-group">
        <label htmlFor="countryCode">Country code</label>
        <input
          id="countryCode"
          name="countryCode"
          value={formState.countryCode}
          onChange={onFieldChange}
          required
        />
      </div>

      <div className="field-group field-group-full">
        <label htmlFor="deliveryNotes">{notesLabel}</label>
        <textarea
          id="deliveryNotes"
          name="deliveryNotes"
          value={formState.deliveryNotes}
          onChange={onFieldChange}
          placeholder="Gate codes, landmarks, preferred drop spot"
        />
      </div>

      <div className="field-group field-group-full">
        <label>Address capture status</label>
        <div className="address-status-card">
          <strong>
            {formState.validationProvider === "google_places"
              ? "Autocomplete selected"
              : "Manual entry"}
          </strong>
          <p className="form-helper">
            {formState.validationProvider === "google_places"
              ? "Place ID and coordinates will be saved alongside the address for later validation and routing."
              : "This address will save as manual entry until validation is added or an autocomplete selection is made."}
          </p>
        </div>
      </div>
    </>
  );
}
