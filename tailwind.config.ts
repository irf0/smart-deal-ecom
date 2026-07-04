import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // SmartDeal warm soft-UI tokens
        surface: '#F0E6D8',
        'surface-light': '#FFFAF4',
        'surface-dark': '#C8B8A4',
        ink: '#2C2218',
        'ink-muted': '#6E5F4F',
        accent: '#D4532A',
        'accent-hover': '#B8431F',
        'accent-warm': '#E8A317',
        success: '#3A8F5C',
        strike: '#A89482',
      },
      borderRadius: {
        'neu-sm': '12px',
        neu: '20px',
        'neu-lg': '28px',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', 'Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
}

export default config
