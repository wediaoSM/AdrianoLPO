/** @type {import('tailwindcss').Config} */
module.exports = {
  content: {
    files: [
      './index.html',
      './**/*.{js,ts,jsx,tsx}'
    ],
    safelist: [
      // BG gold
      'bg-gold-500','bg-gold-500/10','bg-gold-500/5','bg-gold-600','bg-gold-600/10','bg-gold-600/20','bg-gold-600/5','bg-gold-700','bg-gold-900/10',
      // BG luxury
      'bg-luxury-700','bg-luxury-800','bg-luxury-900','bg-luxury-900/90','bg-luxury-950','bg-luxury-950/40','bg-luxury-950/50','bg-luxury-950/80','bg-luxury-950/95',
      // Text colors
      'text-gold-100','text-gold-200','text-gold-200/90','text-gold-300','text-gold-400','text-gold-500','text-gold-500/30','text-gold-500/80','text-gold-600','text-gold-700',
      'text-gray-200','text-gray-300','text-gray-400','text-gray-500','text-gray-600','text-gray-700',
      // Borders
      'border-gold-500','border-gold-500/30','border-gold-500/40','border-gold-500/50','border-gold-500/60','border-gold-600/30','border-gold-700','border-gold-900/10','border-gold-900/20','border-gold-900/30','border-gold-900/50',
      'border-luxury-600/10','border-luxury-600/20','border-luxury-600/30','border-luxury-600/40','border-luxury-700','border-luxury-700/50','border-luxury-800','border-luxury-800/20','border-luxury-800/30','border-luxury-900',
      // Focus rings
      'focus:ring-gold-400','focus:ring-gold-500','focus:ring-gray-500','focus:ring-offset-luxury-900','focus:ring-offset-luxury-950',
      // Backdrops and shadows
      'backdrop-blur-md','backdrop-blur-sm','backdrop-blur-xl','shadow-2xl','shadow-lg','shadow-black/40','shadow-black/50','drop-shadow-md','drop-shadow-lg'
    ]
  },
  // safelist removido daqui, fica só em content.safelist
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
