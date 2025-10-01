/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./context/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'brand-primary': '#8b5cf6', // YDS Violet 500
        'brand-secondary': '#7c3aed', // YDS Violet 600
        'adai-primary': '#8b5cf6', // ADAI Violet 500
        'adai-secondary': ' #6d28d9', // ADAI Violet 700
      }
    }
  },
  plugins: [],
}