/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
        colors: {
            // Custom dark theme grays
            dark: {
                900: '#121212', // Deep background
                800: '#1E1E1E', // Editor/Card background
                700: '#2D2D2D', // Borders/Hovers
            }
        }
    },
  },
  plugins: [],
}