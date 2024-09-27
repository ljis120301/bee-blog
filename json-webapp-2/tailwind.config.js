/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "light-purple": "#B49FDC",
        "light-blue": "#C5EBFE",
        "light-green": "#A5F8CE",
        "light-yellow": "#FEFD97",
        "light-peach": "#FEC9A7",
        "light-pink": "#F197C0",
      },
    },
  },
  plugins: [],
};
