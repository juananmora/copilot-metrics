/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Stitch / Accenture Design System
        "accenture-purple": "#A100FF",
        "accenture-black": "#000000",
        "accenture-gray": "#757575",
        "bg-light": "#FFFFFF",
        "card-bg": "#FFFFFF",
        "border-light": "#E0E0E0",
        accenture: {
          purple: '#A100FF',
          'purple-dark': '#7500C0',
          'purple-deep': '#460073',
          'purple-light': '#C966FF',
          'purple-soft': '#E8CCFF',
          black: '#000000',
          white: '#FFFFFF',
          gray: {
            50: '#F9FAFB',
            100: '#F3F4F6',
            200: '#E5E7EB',
            300: '#D1D5DB',
            400: '#9CA3AF',
            500: '#6B7280',
            600: '#4B5563',
            700: '#374151',
            800: '#1F2937',
            900: '#111827',
          },
          success: '#00A551',
          warning: '#FFB800',
          error: '#E4002B',
          info: '#0070AD',
        },
      },
      fontFamily: {
        display: ['Inter', 'sans-serif'],
        sans: ['Inter', 'Segoe UI', 'Helvetica', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        "card": "0 2px 8px rgba(0, 0, 0, 0.05)",
        "card-hover": "0 8px 16px rgba(161, 0, 255, 0.15)",
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
