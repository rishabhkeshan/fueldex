import tailwindScrollbar from 'tailwind-scrollbar';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        fuel: {
          green: '#00FFA3',
          dark: {
            900: '#000000',
            800: '#111111',
            700: '#1A1A1A',
            600: '#222222'
          }
        },
        dex: {
          sand: '#FCE5B2', // sand background
          lightSand: '#F9E7C2', // input bg
          aqua: '#5FE3D6', // main card/bg
          coral: '#F89B82', // button/accent
          dark: '#2B4A3D', // main text
          sky: '#AEEAFD',  // sky blue
          blue: '#4FC3F7', // accent blue
          teal: '#3DDAD7', // accent teal
          orange: '#FFA726', // accent orange
          brown: '#B57B4A', // palm trunk
          green: '#3CB371', // palm leaves
          white: '#FFF',
          black: '#222',
        }
      },
    },
  },
  plugins: [
    tailwindScrollbar({ nocompatible: true }),
  ],
}