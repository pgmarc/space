import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-dark': '#181a20',
        'secondary-dark': '#23272f',
        'accent-dark': '#6366f1',
        'surface-dark': '#23272f',
        'text-dark': '#e5e7eb',
      },
    },
  },
  plugins: [],
};

export default config;