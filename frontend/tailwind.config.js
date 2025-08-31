/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Market-specific colors
        'market': {
          'up': '#10B981',      // Green for price increases
          'down': '#EF4444',    // Red for price decreases
          'neutral': '#6B7280', // Gray for no change
          'alert': '#F59E0B',   // Yellow for alerts
          'info': '#3B82F6',    // Blue for information
        },
        // Dark theme colors
        'dark': {
          'bg': '#0F172A',      // Dark background
          'card': '#1E293B',    // Card background
          'border': '#334155',   // Border color
          'text': '#F1F5F9',    // Primary text
          'text-secondary': '#94A3B8', // Secondary text
          'accent': '#3B82F6',  // Accent color
        },
        // Chart colors
        'chart': {
          'line': '#3B82F6',
          'area': '#DBEAFE',
          'grid': '#334155',
          'volume': '#10B981',
        }
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
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
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      gridTemplateColumns: {
        'market': 'repeat(auto-fit, minmax(200px, 1fr))',
        'charts': 'repeat(auto-fit, minmax(400px, 1fr))',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}
