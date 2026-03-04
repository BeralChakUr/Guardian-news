/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#0D1117',
          surface: '#161B22',
          elevated: '#21262D',
          primary: '#58A6FF',
          secondary: '#8B949E',
          accent: '#7EE787',
          warning: '#F0883E',
          danger: '#F85149',
          success: '#3FB950',
        },
      },
    },
  },
  plugins: [],
}
