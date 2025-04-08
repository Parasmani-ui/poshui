/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
    },
  },
  plugins: [],
  future: {
    hoverOnlyWhenSupported: true,
  },
  safelist: [
    'hover:scale-105',
    'hover:-translate-y-1',
    'hover:translate-x-1',
    'hover:shadow-lg',
    'hover:shadow-xl',
    'hover:scale-[1.02]',
    'group-hover:rotate-90',
  ],
} 