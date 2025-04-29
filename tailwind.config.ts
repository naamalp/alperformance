import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-primary-dark': '#051D40',
        'brand-primary-light': '#1C3BD4',
        'brand-secondary-dark': '#C9C9C9',
        'brand-secondary-light': '#E5E5E5',
        'brand-white': '#ffffff',
        'brand-black': '#000000',
      },
      fontFamily: {
        sans: ['var(--font-poppins)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config; 