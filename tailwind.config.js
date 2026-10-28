/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0B1E3D',
          navy: '#1E3A8A',
          blue: '#2563EB',
          yellow: '#FACC15',
        }
      }
    },
  },
  plugins: [],
}
