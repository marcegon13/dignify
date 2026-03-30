/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#050505',
        'cobalt-deep': '#001A4D',
        'cobalt-light': '#007BFF',
        'gold-text': '#E6C200',
        surface: 'rgba(255, 255, 255, 0.05)',
      },
    },
  },
  plugins: [],
}
