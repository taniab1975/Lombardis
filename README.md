# Lombardi's Farm to Fork

Lombardi's Farm to Fork is a local food marketplace connecting shoppers directly
with growers and transporters, cutting food miles, reducing supermarket
markups, and putting more money back in farmers' pockets.

## What is included

- A responsive landing page with clear entry points for shoppers, growers, load
  shifters, and admins
- A Supabase schema designed for role-based users, listings, orders, addresses,
  deliveries, commissions, and payout tracking
- Address strategy notes for accurate delivery capture using autocomplete and
  validation

## Suggested stack

- Frontend: responsive web first
- Backend and auth: Supabase
- Repository hosting: GitHub
- Mobile expansion: shared app flows after the web journey is proven

## Address recommendation

Recommended approach:

- Google Places Autocomplete for address entry
- Google Address Validation API or Loqate for validation
- Structured storage in Supabase for street, suburb, state, postcode, country,
  lat/lng, notes, and validation status
- Manual override and delivery instructions for rural properties and farms

See [docs/address-strategy.md](/Users/tania.byrnes/Desktop/Lombardis%20Farm%20to%20Fork/docs/address-strategy.md)
for the fuller implementation notes.

## Project structure

- [index.html](/Users/tania.byrnes/Desktop/Lombardis%20Farm%20to%20Fork/index.html)
- [styles.css](/Users/tania.byrnes/Desktop/Lombardis%20Farm%20to%20Fork/styles.css)
- [supabase/schema.sql](/Users/tania.byrnes/Desktop/Lombardis%20Farm%20to%20Fork/supabase/schema.sql)
- [docs/address-strategy.md](/Users/tania.byrnes/Desktop/Lombardis%20Farm%20to%20Fork/docs/address-strategy.md)

## Next steps

1. Create a Supabase project and run `supabase/schema.sql`.
2. Create a GitHub repository and push this folder.
3. Replace placeholder entry links with real app routes.
4. Add authentication and onboarding for each role.
