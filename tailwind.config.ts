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
        // Nexplumb Design System Tokens
        navy: {
          DEFAULT: '#0D2137',
          light: '#1a3456',
          dark: '#07121e',
        },
        nxblue: {
          DEFAULT: '#2E86AB',
          light: '#3a9bc4',
          dark: '#246d8a',
        },
        teal: {
          DEFAULT: '#2A9D8F',
          light: '#33b8a7',
          dark: '#1f7a6e',
        },
        orange: {
          DEFAULT: '#E76F51',
          light: '#ec8a70',
          dark: '#c8522d',
        },
        amber: {
          DEFAULT: '#E9C46A',
          light: '#f0d080',
          dark: '#c9a045',
        },
        lgray: {
          DEFAULT: '#F2F4F6',
          dark: '#E5E8EC',
        },
        border: {
          DEFAULT: '#D5D8DC',
        },
        body: {
          DEFAULT: '#1C2833',
        },
        slate: {
          DEFAULT: '#717D7E',
        },
      },
      fontFamily: {
        display: ['Sora', 'Arial', 'Helvetica Neue', 'Helvetica', 'sans-serif'],
        body: ['Lora', 'Georgia', 'serif'],
        mono: ['IBM Plex Mono', 'Courier New', 'monospace'],
        sans: ['Sora', 'Arial', 'Helvetica Neue', 'Helvetica', 'sans-serif'],
      },
      fontSize: {
        // Web scale
        'h1': ['30px', { lineHeight: '1.2', fontWeight: '700' }],
        'h2': ['23px', { lineHeight: '1.3', fontWeight: '700' }],
        'h3': ['19px', { lineHeight: '1.4', fontWeight: '700' }],
        'body': ['15px', { lineHeight: '1.6', fontWeight: '400' }],
        'caption': ['12px', { lineHeight: '1.4', fontWeight: '400' }],
      },
      boxShadow: {
        'card': '0 2px 8px rgba(13,33,55,0.08)',
        'card-hover': '0 6px 24px rgba(13,33,55,0.14)',
        'modal': '0 20px 60px rgba(13,33,55,0.25)',
        'nav': '0 2px 12px rgba(13,33,55,0.10)',
      },
      borderRadius: {
        'btn': '8px',
        'card': '12px',
        'modal': '16px',
      },
      spacing: {
        'sidebar': '240px',
        'filter-sidebar': '280px',
      },
      screens: {
        'mobile': '375px',
        'tablet': '768px',
        'desktop': '1280px',
        'wide': '1440px',
      },
      maxWidth: {
        'content': '1200px',
        'wide-content': '1280px',
      },
    },
  },
  plugins: [],
}

export default config
