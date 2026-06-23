/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#15191E',
        surface: '#FFFFFF',
        canvas: '#F6F5F1',
        line: '#E4E1D8',
        primary: {
          DEFAULT: '#0E5C4F',
          dark: '#0A453B',
          light: '#E4F0EC',
        },
        accent: {
          DEFAULT: '#E0622B',
          dark: '#C04F1F',
          light: '#FCE8DC',
        },
        muted: '#6B7178',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '6px',
        lg: '10px',
      },
    },
  },
  plugins: [],
};
