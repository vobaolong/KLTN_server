module.exports = {
  content: ['./src/**/*.{html,js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      width: { main: '1220px' },
      maxWidth: { main: '1220px' },
      backgroundColor: { main: '#26c' },
      colors: { main: '#26c' }
    },
    fontFamily: {
      main: ['Poppins', 'sans-serif;']
    }
  },
  plugins: []
}
