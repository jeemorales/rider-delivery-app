/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["light", "dark", "fantasy", "halloween", "business", "autumn", "wireframe", "corporate", "winter", "nord", "garden", "pastel", "cmyk", "retro", "acid", "fantasy", "emerald"],
  },
};
