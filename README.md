# Lombardi's Farm to Fork

Lombardi's Farm to Fork is a local food marketplace connecting shoppers directly
with growers and transporters, cutting food miles, reducing supermarket
markups, and putting more money back in farmers' pockets.

## What is included

- A Next.js web app with a responsive landing page and clear entry points for
  shoppers, growers, load shifters, and admins
- Supabase-backed signup and login flows for shopper, grower, and load shifter
  roles
- A role-aware portal page that reads each user profile from Supabase
- A Supabase schema designed for role-based users, listings, orders, addresses,
  deliveries, commissions, and payout tracking
- Address strategy notes for accurate delivery capture using autocomplete and
  validation

## Suggested stack

- Frontend: Next.js web app, responsive and mobile-ready
- Backend and auth: Supabase
- Repository hosting: GitHub
- Mobile expansion: shared app flows after the web journey is proven

## Run locally

1. Install dependencies:
   `npm install`
2. Add environment variables in `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` for address autocomplete
3. Start the app:
   `npm run dev`

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

- [app/page.js](/Users/tania.byrnes/Desktop/Lombardis%20Farm%20to%20Fork/app/page.js)
- [app/signup/page.js](/Users/tania.byrnes/Desktop/Lombardis%20Farm%20to%20Fork/app/signup/page.js)
- [app/login/page.js](/Users/tania.byrnes/Desktop/Lombardis%20Farm%20to%20Fork/app/login/page.js)
- [app/portal/page.js](/Users/tania.byrnes/Desktop/Lombardis%20Farm%20to%20Fork/app/portal/page.js)
- [app/globals.css](/Users/tania.byrnes/Desktop/Lombardis%20Farm%20to%20Fork/app/globals.css)
- [lib/supabase/client.js](/Users/tania.byrnes/Desktop/Lombardis%20Farm%20to%20Fork/lib/supabase/client.js)
- [supabase/schema.sql](/Users/tania.byrnes/Desktop/Lombardis%20Farm%20to%20Fork/supabase/schema.sql)
- [supabase/migrations/20260328162732_initial_schema.sql](/Users/tania.byrnes/Desktop/Lombardis%20Farm%20to%20Fork/supabase/migrations/20260328162732_initial_schema.sql)
- [docs/address-strategy.md](/Users/tania.byrnes/Desktop/Lombardis%20Farm%20to%20Fork/docs/address-strategy.md)

## Next steps

1. Add profile completion flows for shopper, grower, and load shifter.
2. Connect a Google Maps API key so onboarding address autocomplete turns on.
3. Add listings, orders, delivery jobs, and dashboard actions.
4. Expand into mobile once the web flows are proven.
