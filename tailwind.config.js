/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
    '!./src/**/*.test.{js,ts,jsx,tsx}',
    '!./src/**/__tests__/**',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}; 