/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#071746',
          50: '#E8EAF0',
          100: '#C5CAD8',
          200: '#8F98B0',
          300: '#5A6588',
          400: '#2A3268',
          500: '#071746',
          600: '#06123B',
          700: '#050E30',
          800: '#040A25',
          900: '#02061A',
        },
        accent: {
          DEFAULT: '#1A89C8',
          light: '#3AA0DC',
          dark: '#1574AD',
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
        card: '0 2px 8px rgba(7, 23, 70, 0.08)',
        'card-hover': '0 4px 16px rgba(7, 23, 70, 0.15)',
        sidebar: '4px 0 12px rgba(7, 23, 70, 0.1)',
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
