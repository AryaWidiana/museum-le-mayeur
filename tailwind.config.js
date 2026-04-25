/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'museum-brown': '#3B2314',
        'museum-brown-dark': '#2A1810',
        'museum-brown-light': '#5C3A28',
        'museum-gold': '#C9A84C',
        'museum-gold-light': '#D4B85A',
        'museum-cream': '#F5F0E8',
        'museum-cream-dark': '#E8E0D0',
        'museum-beige': '#FAF7F2',
      },
      fontFamily: {
        'serif': ['"Playfair Display"', 'Georgia', 'serif'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
