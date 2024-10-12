const plugin = require('tailwindcss/plugin')

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
        // New custom background colors
        "bg-custom": {
          light: "hsl(var(--bg-custom-light))",
          dark: "hsl(var(--bg-custom-dark))",
        },
        "bg-custom-secondary": {
          light: "hsl(var(--bg-custom-secondary-light))",
          dark: "hsl(var(--bg-custom-secondary-dark))",
        },
        "bg-custom-accent": {
          light: "hsl(var(--bg-custom-accent-light))",
          dark: "hsl(var(--bg-custom-accent-dark))",
        },
        'python': {
          'keyword': 'hsl(var(--cat-frappe-mauve))',
          'builtin': 'hsl(var(--cat-frappe-peach))',
          'string': 'hsl(var(--cat-frappe-green))',
          'function': 'hsl(var(--cat-frappe-blue))',
          'comment': 'hsl(var(--cat-frappe-overlay0))',
          'decorator': 'hsl(var(--cat-frappe-yellow))',
          'number': 'hsl(var(--cat-frappe-peach))',
          'operator': 'hsl(var(--cat-frappe-sky))',
          'class': 'hsl(var(--cat-frappe-yellow))',
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
        beeSwarm: {
          '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
          '25%': { transform: 'translate(15px, 15px) rotate(5deg)' },
          '50%': { transform: 'translate(-10px, 20px) rotate(-5deg)' },
          '75%': { transform: 'translate(-20px, -10px) rotate(3deg)' },
        },
        flapWings: {
          '0%, 100%': { transform: 'scaleX(1)' },
          '50%': { transform: 'scaleX(0.8)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        beeSwarm: 'beeSwarm 10s ease-in-out infinite',
        flapWings: 'flapWings 0.15s ease-in-out infinite',
        wiggle: 'wiggle 0.5s ease-in-out infinite',
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            pre: {
              color: theme('colors.cat-frappe-text'),
              backgroundColor: theme('colors.cat-frappe-surface0'),
            },
            code: {
              color: theme('colors.cat-frappe-text'),
              backgroundColor: 'transparent',
              fontWeight: '400',
              '&::before': {
                content: 'none !important',
              },
              '&::after': {
                content: 'none !important',
              },
            },
          },
        },
      }),
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    plugin(function({ addUtilities, theme }) {
      const newUtilities = {
        '.token.comment,.token.prolog,.token.doctype,.token.cdata': {
          color: theme('colors.cat-frappe-overlay0')
        },
        '.token.punctuation': {
          color: theme('colors.cat-frappe-overlay2')
        },
        '.token.namespace': {
          opacity: '0.7'
        },
        '.token.property,.token.tag,.token.constant,.token.symbol,.token.deleted': {
          color: theme('colors.cat-frappe-red')
        },
        '.token.boolean,.token.number': {
          color: theme('colors.cat-frappe-peach')
        },
        '.token.selector,.token.attr-name,.token.string,.token.char,.token.builtin,.token.inserted': {
          color: theme('colors.cat-frappe-green')
        },
        '.token.operator,.token.entity,.token.url,.language-css .token.string,.style .token.string': {
          color: theme('colors.cat-frappe-teal')
        },
        '.token.atrule,.token.attr-value,.token.keyword': {
          color: theme('colors.cat-frappe-blue')
        },
        '.token.function,.token.class-name': {
          color: theme('colors.cat-frappe-yellow')
        },
        '.token.regex,.token.important,.token.variable': {
          color: theme('colors.cat-frappe-pink')
        },
        '.token.keyword': {
          color: theme('colors.python.keyword')
        },
        '.token.builtin': {
          color: theme('colors.python.builtin')
        },
        '.token.string': {
          color: theme('colors.python.string')
        },
        '.token.function': {
          color: theme('colors.python.function')
        },
        '.token.comment': {
          color: theme('colors.python.comment')
        },
        '.token.decorator': {
          color: theme('colors.python.decorator')
        },
        '.token.number': {
          color: theme('colors.python.number')
        },
        '.token.operator': {
          color: theme('colors.python.operator')
        },
        '.token.class-name': {
          color: theme('colors.python.class')
        },
      }
      addUtilities(newUtilities, ['dark', 'responsive'])
    })
  ],
};
