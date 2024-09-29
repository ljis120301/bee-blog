import "./styles/globals.css";

export const metadata = {
  title: "bee blog",
  description: "Nextjs Refactor",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`antialiased bg-warm-beige`}>{children}</body>
      <link rel="icon" href="/bee-icon.ico" />
    </html>
  );
}
