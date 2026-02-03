/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './apps/**/src/**/*.{html,ts,tsx,js,jsx,astro,vue,md,mdx}',
    './libs/**/src/**/*.{html,ts,tsx,js,jsx,astro,vue,md,mdx}',
    './docs/**/*.{md,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: 'var(--color-primary)',
          surface: 'var(--color-surface)',
        },
      },
    },
  },
  plugins: [],
};
