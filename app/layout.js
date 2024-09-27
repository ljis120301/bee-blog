import "./styles/globals.css";

export const metadata = {
  title: "JSON Website",
  description: "Nextjs Refactor",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`antialiased`}>{children}</body>
    </html>
  );
}
