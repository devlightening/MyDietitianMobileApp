/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/shadcn-ui/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        clinic: {
          DEFAULT: '#f7fafc',
          accent: '#4b5563',
          muted: '#e5e7eb',
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
