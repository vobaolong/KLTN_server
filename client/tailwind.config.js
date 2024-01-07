/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}", "./public/index.html"],
  theme: {
    extend: {
      width: { main: "1220px" },
      backgroundColor: { main: "#093D65" },
      colors: { main: "#093D65" }
    },
    fontFamily: {
      main: ["Poppins", "sans-serif;"]
    }
  },
  plugins: []
}
