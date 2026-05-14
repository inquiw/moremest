/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          50: '#E8F4F8',
          100: '#D9E2E7',
          200: '#B3C5CC',
          300: '#7BA3B0',
          400: '#3D7A8A',
          500: '#1A5566',
          600: '#114E5E',
          700: '#0B3E4A',
          800: '#062B36',
          900: '#0A2230',
          950: '#061A26',
        },
        sand: {
          50: '#FAFAF8',
          100: '#F5F3EF',
          200: '#EBE8E0',
          300: '#D9D4C9',
        },
      },
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      maxWidth: {
        '8xl': '90rem',
      },
    },
  },
  plugins: [],
}
