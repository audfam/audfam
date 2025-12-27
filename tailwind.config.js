/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        crypto: ['Inter', 'system-ui', 'sans-serif'],
        // optional extras if you want later:
        mono: ['JetBrains Mono', 'monospace'], // for wallet addresses, tx hashes
      },
    },
  },
  plugins: [],
}
