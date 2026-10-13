/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep Forest Green Spectrum (Permanent Canvas)
        forest: {
          950: '#061F19', // Primary background canvas
          900: '#0B2B23', // Secondary background
          850: '#0D2A22', // Card background
          800: '#10362B', // Elevated surfaces / modals
          750: '#1B4034',
          700: '#29473A', // Structural borders & dividers
          600: '#3D5E4F',
        },
        // Warm Gold Spectrum (Signature Primary Accent)
        gold: {
          400: '#F2CE85',
          500: '#E9BD67', // Primary warm gold accent
          600: '#B9944D', // Muted antique gold
          700: '#8E6F31',
          800: '#634C1D',
          900: '#3D2D0C',
        },
        // Warm Ivory & Editorial Panels
        ivory: {
          50: '#FAF7F0',
          100: '#F5F0E5', // Primary text on dark surfaces
          200: '#F0E3CB', // Light editorial panel background
          300: '#E2CEAA',
          800: '#2B3930',
          900: '#17251D', // Light panel dark text
        },
        // Muted Sage Gray (Secondary & Metadata Text)
        sage: {
          300: '#D5DDD4',
          400: '#B8C3B7', // Secondary text
          500: '#8A9C89',
          600: '#5F735E',
        },
        // Restrained Status Colors
        terracotta: {
          300: '#E59987',
          500: '#C45A45', // Restrained terracotta for potential issues
          800: '#7E3020',
          950: '#33100A',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        button: '6px',
        card: '10px',
      },
    },
  },
  plugins: [],
}
