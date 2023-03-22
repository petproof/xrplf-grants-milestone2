/** @type {import('tailwindcss').Config} */
const withMT = require("@material-tailwind/react/utils/withMT");

module.exports = withMT({
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'pp-brown': '#722a24',
        'pp-red': '#db3b35',
        'pp-blue': '#2a3957',
      },
    },
  },
  plugins: [],
});
