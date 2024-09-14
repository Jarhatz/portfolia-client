// @type {import('tailwindcss').Config}
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'fade-in-out': 'fadeInOut 1.2s linear infinite',
        flicker: 'flicker 0.5s infinite',
      },
      keyframes: {
        fadeInOut: {
          '0%, 100% ': {
            opacity: '1',
          },
          '50%': {
            opacity: '0.5',
          },
        },
        flicker: {
          '0%': {
            opacity: 0,
          },
          '50%': {
            opacity: 1,
          },
          '100%': {
            opacity: 0,
          },
        },
      },
    },
  },
  plugins: [],
}

