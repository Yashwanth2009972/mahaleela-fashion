/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        luxury: {
          black: '#0a0a0a',
          dark: '#111111',
          surface: '#171717',
          border: '#262626',
          cream: '#fbf9f4',
          ivory: '#f4ede1',
          sand: '#e8decd',
          gold: '#c5a059',
          goldLight: '#e4c98c',
          goldDark: '#967434',
          muted: '#807e78',
          grey: '#525252'
        }
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', '"Playfair Display"', 'Georgia', 'serif'],
        cinzel: ['"Cinzel"', '"Cormorant Garamond"', 'serif'],
        sans: ['"Montserrat"', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        widest2: '0.25em',
        luxury: '0.35em',
      },
      animation: {
        'fade-in': 'fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'reveal-up': 'revealUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        revealUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
