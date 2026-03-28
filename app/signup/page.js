import SignupForm from "./signup-form";

const roleOptions = ["shopper", "grower", "load_shifter"];

export default async function SignupPage({ searchParams }) {
  const params = await searchParams;
  const initialRole = roleOptions.includes(params?.role) ? params.role : "shopper";

  return <SignupForm initialRole={initialRole} />;
}
