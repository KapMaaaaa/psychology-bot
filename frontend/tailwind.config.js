// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)'],
        serif: ['var(--font-serif)'],
      },
      animation: {
        'pulse-guest': 'pulse-guest 2s infinite',
        'typing': 'typing 1.4s infinite ease-in-out both',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        'pulse-guest': {
          '0%, 100%': { opacity: 0.7 },
          '50%': { opacity: 1 },
        },
        'typing': {
          '0%, 80%, 100%': { transform: 'scale(0)' },
          '40%': { transform: 'scale(1)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}