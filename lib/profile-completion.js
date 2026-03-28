export function getRoleLabel(role) {
  if (role === "load_shifter") {
    return "Load Shifter";
  }

  return role ? role.charAt(0).toUpperCase() + role.slice(1) : "Shopper";
}

export function getCompletionState({
  profile,
  primaryAddress,
  growerProfile,
  loadShifterProfile,
}) {
  const role = profile?.role || "shopper";
  const sharedComplete = Boolean(profile?.full_name && profile?.phone);

  if (role === "shopper") {
    return {
      complete:
        sharedComplete &&
        Boolean(primaryAddress?.address_line_1 && primaryAddress?.suburb && primaryAddress?.postcode),
      checklist: [
        {
          label: "Contact details",
          done: sharedComplete,
        },
        {
          label: "Delivery address",
          done: Boolean(primaryAddress?.address_line_1 && primaryAddress?.suburb && primaryAddress?.postcode),
        },
      ],
    };
  }

  if (role === "grower") {
    return {
      complete:
        sharedComplete &&
        Boolean(profile?.company_name) &&
        Boolean(growerProfile?.farm_name) &&
        Boolean(primaryAddress?.address_line_1 && primaryAddress?.suburb),
      checklist: [
        {
          label: "Contact details",
          done: sharedComplete,
        },
        {
          label: "Business details",
          done: Boolean(profile?.company_name && growerProfile?.farm_name),
        },
        {
          label: "Farm address",
          done: Boolean(primaryAddress?.address_line_1 && primaryAddress?.suburb),
        },
      ],
    };
  }

  if (role === "load_shifter") {
    return {
      complete:
        sharedComplete &&
        Boolean(profile?.service_area) &&
        Boolean(loadShifterProfile?.vehicle_type),
      checklist: [
        {
          label: "Contact details",
          done: sharedComplete,
        },
        {
          label: "Service area",
          done: Boolean(profile?.service_area),
        },
        {
          label: "Vehicle details",
          done: Boolean(loadShifterProfile?.vehicle_type),
        },
      ],
    };
  }

  return {
    complete: sharedComplete,
    checklist: [
      {
        label: "Contact details",
        done: sharedComplete,
      },
    ],
  };
}
