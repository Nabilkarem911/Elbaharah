/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1A89C8',
          50: '#E8F4FB',
          100: '#C5E4F3',
          200: '#8FCCE8',
          300: '#5AB5DC',
          400: '#2A9DCE',
          500: '#1A89C8',
          600: '#1574AD',
          700: '#071746',
          800: '#051030',
          900: '#030A1E',
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
        card: '0 2px 8px rgba(26, 137, 200, 0.08)',
        'card-hover': '0 4px 16px rgba(26, 137, 200, 0.15)',
        sidebar: '4px 0 12px rgba(26, 137, 200, 0.1)',
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
