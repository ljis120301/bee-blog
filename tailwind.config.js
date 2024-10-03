
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./app/**/*.{js,jsx}",
    "./src/**/*.{js,jsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        "light-purple": "#B49FDC",
        "light-blue": "#C5EBFE",
        
        "light-green": "#A5F8CE",
        "greenish": "#e2F0CB",
        "muted-green": "#DDD8D4",

        "light-peach": "#FEC9A7",
        "light-pink": "#F197C0",
        
        "tan": "F1DCC5",
        "blurple": "#A09AFF",

        "yellow-1": "#f9f9c1",
        "yellow-2": "#f9ee99",
        "light-yellow": "#FEFD97",
        "pastel-yellow": "#F2E8CE",
        "yellow-3": "#ecd97c",

        "warm-beige": "#f5f5dc",

        'cat-frappe-rosewater': '#f2d5cf',
        'cat-frappe-flamingo': '#eebebe',
        'cat-frappe-pink': '#f4b8e4',
        'cat-frappe-mauve': '#ca9ee6',
        'cat-frappe-red': '#e78284',
        'cat-frappe-maroon': '#ea999c',
        'cat-frappe-peach': '#ef9f76',
        'cat-frappe-yellow': '#e5c890',
        'cat-frappe-green': '#a6d189',
        'cat-frappe-teal': '#81c8be',
        'cat-frappe-sky': '#99d1db',
        'cat-frappe-sapphire': '#85c1dc',
        'cat-frappe-blue': '#8caaee',
        'cat-frappe-lavender': '#babbf1',
        'cat-frappe-text': '#c6d0f5',
        'cat-frappe-subtext1': '#b5bfe2',
        'cat-frappe-subtext0': '#a5adce',
        'cat-frappe-overlay2': '#949cbb',
        'cat-frappe-overlay1': '#838ba7',
        'cat-frappe-overlay0': '#737994',
        'cat-frappe-surface2': '#626880',
        'cat-frappe-surface1': '#51576d',
        'cat-frappe-surface0': '#414559',
        'cat-frappe-base': '#303446',
        'cat-frappe-mantle': '#292c3c',
        'cat-frappe-crust': '#232634',
        
        ctp: {
          base: '#303446',
          surface0: '#414559',
          surface1: '#51576d',
          text: '#c6d0f5',
          rosewater: '#f2d5cf',
          lavender: '#babbf1',
          blue: '#8caaee',
          sapphire: '#85c1dc',
          yellow: '#e5c890',
          peach: '#ef9f76',
          green: '#a6d189',
          teal: '#81c8be',
        },



      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },


    },
  },
  plugins: [require("tailwindcss-animate")],
 
};

