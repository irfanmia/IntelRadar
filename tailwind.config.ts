import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        breaking: { DEFAULT: '#dc2626', light: '#fef2f2' },
        important: { DEFAULT: '#d97706', light: '#fffbeb' },
        info: { DEFAULT: '#2563eb', light: '#eff6ff' },
      },
      backdropBlur: { xs: '2px' },
    },
  },
  plugins: [],
}
export default config
