import "./globals.css";

export const metadata = {
  title: "Lombardi's Farm to Fork",
  description:
    "Local food marketplace connecting shoppers, growers, and transporters with fewer middlemen and fresher paddock-to-plate food.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
