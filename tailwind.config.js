/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#007AFF',
          dark: '#0051D5',
          light: '#4DA2FF',
        },
        secondary: {
          DEFAULT: '#5856D6',
          dark: '#3634A3',
          light: '#8583E8',
        },
      },
    },
  },
  plugins: [
    require("@kobalte/tailwindcss"),
  ],
}
