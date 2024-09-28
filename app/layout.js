import "./styles/globals.css";

export const metadata = {
  title: "bee blog",
  description: "a cute lil blog website",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`antialiased`}>{children}</body>
      <link rel="icon" href="/bee-icon.ico" sizes="any" />
      <link
        rel="icon"
        href="/bee-icon.ico"
        type=""
        sizes="any"
        />
        <link
        rel="apple-touch-icon"
        href="/bee-icon.ico"
        type=""
        sizes="any"
      />


    </html>
  );
}
