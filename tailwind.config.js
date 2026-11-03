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
          orange: '#FF9900',
          orangeHover: '#E88B00',
          dark: '#0F1111',
          navy: '#131921',
          slate: '#232F3E',
          accent: '#2563EB',
          canvas: '#F1F5F9'
        }
      }
    },
  },
  plugins: [],
}
