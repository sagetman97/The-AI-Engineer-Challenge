/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          pink: '#ff00ff',
          blue: '#00ffff',
          purple: '#b026ff',
          yellow: '#ffff00',
        },
        dark: '#0a0a0a',
      },
      boxShadow: {
        neon: '0 0 5px theme(colors.neon.pink), 0 0 20px theme(colors.neon.pink)',
        'neon-blue': '0 0 5px theme(colors.neon.blue), 0 0 20px theme(colors.neon.blue)',
      },
      animation: {
        'neon-pulse': 'neon-pulse 1.5s ease-in-out infinite',
      },
      keyframes: {
        'neon-pulse': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
      },
    },
  },
  plugins: [],
}  