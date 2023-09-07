/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./**/*.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
    fontFamily: {
      'heading': ['"Karla"', 'sans-serif'],
      'body': ['"Open Sans"', 'sans-serif'],
    }
  },
  plugins: [],
}

