/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          primary: {
            300: '#93c5fd', // Light blue
            400: '#60a5fa', // Blue
            500: '#3b82f6', // Main blue
            600: '#2563eb', // Darker blue
          },
          secondary: '#64748B', // Slate Gray
          accent: {
            300: '#c4b5fd', // Light purple
            400: '#a78bfa', // Purple
            500: '#8b5cf6', // Main purple
            600: '#7c3aed', // Darker purple
          },
          neutral: '#F3F4F6', // Light Gray
          white: '#FFFFFF',
          slate: {
            700: '#334155',
            800: '#1e293b',
            900: '#0f172a',
          },
        },
        fontFamily: {
          sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        },
        animation: {
          'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        },
      },
    },
    plugins: [],
  }
  