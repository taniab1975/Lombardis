# Address strategy

For Lombardi's Farm to Fork, the best first implementation is:

1. Use Google Places Autocomplete for the address search box on web and mobile.
2. Validate the selected address with Google Address Validation API or Loqate.
3. Store a structured address record in Supabase.
4. Keep manual override, pin drop, and delivery notes for rural and farm
   properties.

## Why

- It gives shoppers a familiar autofill experience.
- It reduces keystrokes and failed deliveries.
- It works well across web, iPhone, and Android.
- It supports later route matching for growers, load shifters, and hub drops.

## Store these fields

- `address_line_1`
- `address_line_2`
- `suburb`
- `state`
- `postcode`
- `country_code`
- `formatted_address`
- `latitude`
- `longitude`
- `delivery_notes`
- `validation_provider`
- `validation_status`
- `place_id`

## Important edge cases

- Rural addresses may not fully resolve.
- Farm pickups often need a gate, shed, or landmark note.
- Meat or dairy deliveries may require tighter delivery windows.
- Some users will need to override or confirm a pin on a map.

## Suggested UX flow

1. User starts typing an address.
2. Autocomplete shows suggestions.
3. User selects a suggestion.
4. The app fills the structured fields.
5. Validation runs in the background.
6. If confidence is low, prompt the user for confirmation or a pinned location.
