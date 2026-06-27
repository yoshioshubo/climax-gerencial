/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        climax: {
          gold: '#C9A84C',
          'gold-light': '#E8C96A',
          dark: '#1A0000',
          'dark-2': '#2A0000',
          'dark-card': '#220000',
          'dark-border': '#4A1010',
          red: '#C0392B',
          'red-light': '#E74C3C',
        }
      },
      fontFamily: {
        display: ['Georgia', 'serif'],
      },
      keyframes: {
        'press-in': {
          '0%': { transform: 'scale(1) translateY(0)', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' },
          '50%': { transform: 'scale(0.96) translateY(3px)', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' },
          '100%': { transform: 'scale(1) translateY(0)', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      },
      animation: {
        'press-in': 'press-in 0.3s ease',
        'fade-up': 'fade-up 0.4s ease forwards',
        'shimmer': 'shimmer 2.5s linear infinite',
      }
    },
  },
  plugins: [],
}
