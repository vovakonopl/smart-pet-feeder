/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.tsx', './components/**/*.tsx'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: 'var(--background) / <alpha-value>',
        foreground: 'var(--foreground) / <alpha-value>',
        primary: 'rgb(var(--primary) / <alpha-value>)',
        'primary-foreground': 'var(--primary-foreground) / <alpha-value>',
        secondary: 'var(--secondary) / <alpha-value>',
        'secondary-foreground': 'var(--secondary-foreground) / <alpha-value>',
        card: 'var(--card) / <alpha-value>',
        'card-foreground': 'var(--card-foreground) / <alpha-value>',
        muted: 'var(--muted) / <alpha-value>',
        'muted-foreground': 'var(--muted-foreground) / <alpha-value>',
        destructive: 'var(--destructive) / <alpha-value>',
        border: 'var(--border) / <alpha-value>',
        input: 'var(--input) / <alpha-value>',
        ring: 'var(--ring) / <alpha-value>',
      },
      fontFamily: {
        nunito: 'NunitoSans',
        openSans: 'OpenSans',
      },
    },
  },
  plugins: [],
};
