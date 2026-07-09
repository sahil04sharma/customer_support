/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          DEFAULT: '#0c1222',
          50: '#f4f6f9',
          100: '#e8ecf2',
          200: '#cdd5e3',
          300: '#a3b0c7',
          400: '#7488a5',
          500: '#556a8a',
          600: '#425370',
          700: '#36445c',
          800: '#2f3a4e',
          900: '#1a2233',
          950: '#0c1222',
        },
        accent: {
          DEFAULT: '#0d9488',
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        paper: '#f6f5f2',
        'paper-warm': '#faf9f7',
      },
      boxShadow: {
        card: '0 1px 2px rgb(12 18 34 / 0.04), 0 4px 16px rgb(12 18 34 / 0.04)',
        'card-hover': '0 4px 8px rgb(12 18 34 / 0.06), 0 12px 32px rgb(12 18 34 / 0.08)',
        sidebar: '4px 0 24px rgb(12 18 34 / 0.04)',
        glow: '0 0 0 1px rgb(13 148 136 / 0.12), 0 8px 24px rgb(13 148 136 / 0.12)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.125rem',
        '3xl': '1.5rem',
      },
      backgroundImage: {
        'mesh-auth':
          'radial-gradient(ellipse 80% 60% at 20% 40%, rgb(13 148 136 / 0.35), transparent 55%), radial-gradient(ellipse 60% 50% at 80% 20%, rgb(20 184 166 / 0.2), transparent 50%), radial-gradient(ellipse 50% 40% at 60% 90%, rgb(15 118 110 / 0.25), transparent 50%)',
        'mesh-subtle':
          'radial-gradient(ellipse 70% 50% at 100% 0%, rgb(13 148 136 / 0.06), transparent 50%), radial-gradient(ellipse 50% 40% at 0% 100%, rgb(12 18 34 / 0.03), transparent 50%)',
        'hero-glow':
          'radial-gradient(ellipse 80% 60% at 50% -10%, rgb(13 148 136 / 0.15), transparent 60%), radial-gradient(ellipse 50% 40% at 90% 80%, rgb(20 184 166 / 0.08), transparent 50%)',
        'dot-grid':
          'radial-gradient(circle, rgb(12 18 34 / 0.07) 1px, transparent 1px)',
      },
      backgroundSize: {
        'dot-grid': '24px 24px',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.45s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
};
