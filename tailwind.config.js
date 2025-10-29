/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // --- PATIENT-FIRST DESIGN SYSTEM ---
        brand: {
          50:  '#eef9f8',
          100: '#d5f2ef',
          200: '#afe4de',
          300: '#7dd3c8',
          400: '#40bfae',
          500: '#14a693', // PRIMARY BRAND COLOR (trust + calm)
          600: '#0d8778',
          700: '#0b6c61',
          800: '#09564e',
          900: '#073e37',
          DEFAULT: '#14a693',
          foreground: '#ffffff',
        },
    
        accent: {
          50: '#fdf6f0',
          100: '#fae3d0',
          200: '#f5c49c',
          300: '#f0a268',
          400: '#eb823b',
          500: '#e76e22', // soft orange accent for energy and health
          600: '#c35b1c',
          700: '#a14a17',
          800: '#7f3b12',
          900: '#5e2d0e',
        },
    
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
    
        success: {
          100: '#dcfce7',
          500: '#22c55e',
          700: '#15803d',
        },
    
        warning: {
          100: '#fef3c7',
          500: '#f59e0b',
          700: '#b45309',
        },
    
        danger: {
          100: '#fee2e2',
          500: '#ef4444',
          700: '#b91c1c',
        },


        fontFamily: {
          sans: ["Inter", "system-ui", "sans-serif"],
          heading: ["Poppins", "Inter", "sans-serif"], // friendly yet clean
        },
        fontSize: {
          xs: ['0.75rem', { lineHeight: '1rem' }],
          sm: ['0.875rem', { lineHeight: '1.25rem' }],
          base: ['1rem', { lineHeight: '1.6rem' }],
          lg: ['1.125rem', { lineHeight: '1.75rem' }],
          xl: ['1.25rem', { lineHeight: '1.8rem' }],
          '2xl': ['1.5rem', { lineHeight: '2rem' }],
          '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
          '4xl': ['2.25rem', { lineHeight: '2.75rem' }],
          '5xl': ['3rem', { lineHeight: '1' }],
        },
        
        
        // Base UI colors
        background: '#f9fbfb',  // soft medical off-white
        foreground: '#0f172a',  // deep navy for text readability
        card: '#ffffff',
        border: '#e5e7eb',
      },
    }    
  },
  plugins: [require("tailwindcss-animate")],
}
