const colors = require('tailwindcss/colors');


module.exports = {
  purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: false,
  theme: {
    extend: {
      colors: {
        gray: colors.trueGray,
        red: {
          '50': '#FBECEB',
          '100': '#F7D8D6',
          '200': '#EFAFAB',
          '300': '#E78680',
          '400': '#DF5D55',
          '500': '#D7342A',
          '600': '#AD2921',
          '700': '#821F19',
          '800': '#581510',
          '900': '#2D0A08'
        }
      },
      height: {
        'screen/2': '50vh'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace']
      }
    },
    container: {
      center: true,
      padding: '2rem',
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
      }
    },
    transitionDuration: {
      DEFAULT: '250ms'
    }
  },
  variants: {
    extend: {
      backgroundColor: ['active']
    }
  },
  plugins: [],
}
