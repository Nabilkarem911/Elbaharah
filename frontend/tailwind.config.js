/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0D3B4F',
          50: '#E8F0F3',
          100: '#C5D9E0',
          200: '#8FB3C0',
          300: '#5A8DA0',
          400: '#2A6D85',
          500: '#0D3B4F',
          600: '#0A3040',
          700: '#072530',
          800: '#051A20',
          900: '#031015',
        },
        gold: {
          DEFAULT: '#D4A843',
          light: '#E5C170',
          dark: '#B8902F',
        },
        success: '#16A34A',
        danger: '#DC2626',
      },
      fontFamily: {
        sans: ['Cairo', 'Inter', 'sans-serif'],
        display: ['Cairo', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 8px rgba(13, 59, 79, 0.08)',
        'card-hover': '0 4px 16px rgba(13, 59, 79, 0.15)',
        sidebar: '4px 0 12px rgba(13, 59, 79, 0.1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
