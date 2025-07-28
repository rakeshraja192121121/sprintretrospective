/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // ...your existing paths
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require("@tailwindcss/typography"), // Add this line
  ],
};
