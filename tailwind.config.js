/** @type {import('tailwindcss').Config} */
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cockpit Design System
        cockpit: {
          bg: '#09090b',         // 全体の背景 (zinc-950)
          panel: 'rgba(24, 24, 27, 0.6)', // パネル背景 (Glass)
          border: 'rgba(255, 255, 255, 0.1)', // パネル枠線
          text: {
            primary: '#e4e4e7',   // zinc-200
            secondary: '#a1a1aa', // zinc-400
            muted: '#52525b',     // zinc-600
          },
          accent: '#3b82f6',     // ProPILOT Blue
          danger: '#ef4444',     // Red
          success: '#10b981',    // Green
        }
      },
      fontFamily: {
        sans: ['"Inter"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"SF Mono"', 'Consolas', 'monospace'], // 計器用
        display: ['"Rajdhani"', '"Inter"', 'sans-serif'], // 速度計などの大型数値用
      },
      animation: {
        'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        }
      }
    },
  },
  plugins: [],
}