import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#001C3D', light: '#E6F0FF', dark: '#00132B' },
        success: { DEFAULT: '#059669', light: '#D1FAE5' },
        warning: { DEFAULT: '#D97706', light: '#FEF3C7' },
        error: { DEFAULT: '#DC2626', light: '#FEE2E2' },
        info: { DEFAULT: '#2563EB', light: '#DBEAFE' },
        surface: '#FFFFFF',
        border: '#E2E8F0',
        textPrimary: '#1E293B',
        textSecondary: '#475569',
        textMuted: '#94A3B8',
      },
      fontFamily: {
        sans: ['var(--font-inter)', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
};
export default config;
