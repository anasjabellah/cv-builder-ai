/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    './src/shared/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#C800DF',
        'primary-hover': '#A600B8',
        secondary: '#E60076',
        'secondary-hover': '#C00062',
        success: '#16A34A',
        warning: '#D97706',
        danger: '#DC2626',
        surface: '#111111',
        'surface-hover': '#1A1A1A',
        'surface-light': '#1F1F1F',
        border: '#27272A',
        'text-primary': '#FFFFFF',
        'text-secondary': '#A1A1AA',
        'text-muted': '#52525B',
      },
      fontFamily: {
        sans: ['Jost', 'sans-serif'],
        display: ['Jost', 'sans-serif'],
        mono: ['Overpass Mono', 'monospace'],
      },
      fontWeight: {
        100: '100',
        200: '200',
        300: '300',
        400: '400',
        500: '500',
        600: '600',
        700: '700',
        800: '800',
        900: '900',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
  plugins: [],
};
