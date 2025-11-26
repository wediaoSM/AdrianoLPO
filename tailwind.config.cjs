/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Cinzel', 'serif'],
        sans: ['Montserrat', 'sans-serif'],
      },
      colors: {
        gold: {
          50: '#F9F5EB',
          100: '#E8DFC5',
          200: '#D6C69A',
          300: '#C4AD70',
          400: '#B69A55',
          500: '#9E8038',
          600: '#7F6526',
          700: '#614B18',
          800: '#453410',
          900: '#2A1F08'
        },
        luxury: {
          950: '#0c0a09',
          900: '#1c1917',
          800: '#292524',
          700: '#44403c',
          600: '#57534e',
        }
      },
      animation: {
        'fade-up': 'fadeUp 0.8s ease-out forwards',
        'fade-in': 'fadeIn 1s ease-out forwards',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        }
      }
    }
  },
  plugins: [],
};
