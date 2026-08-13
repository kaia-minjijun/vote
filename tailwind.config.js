/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0b0f19',
          card: '#151c2e',
          accent: '#3b82f6',
          purple: '#8b5cf6',
          emerald: '#10b981',
          gold: '#f59e0b'
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounce 2s infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 10px rgba(59, 130, 246, 0.4)' },
          '100%': { boxShadow: '0 0 25px rgba(139, 92, 246, 0.8)' }
        }
      }
    },
  },
  plugins: [],
}
