import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        mono: ['Berkeley Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        // ── RoleGenie / Stitch Design System ──────────────────────────
        background: '#051424',
        surface: {
          DEFAULT: '#051424',
          dim: '#051424',
          bright: '#2c3a4c',
          container: {
            DEFAULT: '#122131',
            lowest: '#010f1f',
            low: '#0d1c2d',
            high: '#1c2b3c',
            highest: '#273647',
          },
          variant: '#273647',
          tint: '#d0bcff',
        },
        'on-surface': '#d4e4fa',
        'on-surface-variant': '#cbc3d7',
        'on-background': '#d4e4fa',
        outline: {
          DEFAULT: '#958ea0',
          variant: '#494454',
        },
        // Primary: Lavender
        primary: {
          DEFAULT: '#d0bcff',
          container: '#a078ff',
          fixed: '#e9ddff',
          'fixed-dim': '#d0bcff',
        },
        'on-primary': '#3c0091',
        'on-primary-container': '#340080',
        'on-primary-fixed': '#23005c',
        'on-primary-fixed-variant': '#5516be',
        'inverse-primary': '#6d3bd7',
        // Secondary: Mint green
        secondary: {
          DEFAULT: '#4edea3',
          container: '#00a572',
          fixed: '#6ffbbe',
          'fixed-dim': '#4edea3',
        },
        'on-secondary': '#003824',
        'on-secondary-container': '#00311f',
        'on-secondary-fixed': '#002113',
        'on-secondary-fixed-variant': '#005236',
        // Tertiary: Coral
        tertiary: {
          DEFAULT: '#ffb3af',
          container: '#f55e5d',
          fixed: '#ffdad7',
          'fixed-dim': '#ffb3af',
        },
        'on-tertiary': '#68000e',
        'on-tertiary-container': '#5c000b',
        'on-tertiary-fixed': '#410005',
        'on-tertiary-fixed-variant': '#8e101c',
        // Error
        error: {
          DEFAULT: '#ffb4ab',
          container: '#93000a',
        },
        'on-error': '#690005',
        'on-error-container': '#ffdad6',
        // Inverse
        'inverse-surface': '#d4e4fa',
        'inverse-on-surface': '#233143',
        // ── Legacy support ────────────────────────────────────────────
        // Keep these so any unrewritten components don't break
        primary50: '#f0f9ff',
        primary100: '#e0f2fe',
        primary400: '#38bdf8',
        primary500: '#0ea5e9',
        primary600: '#0284c7',
        primary700: '#0369a1',
        // Neutral
        neutral: {
          50: '#f9fafb', 100: '#f3f4f6', 200: '#e5e7eb',
          300: '#d1d5db', 400: '#9ca3af', 500: '#6b7280',
          600: '#4b5563', 700: '#374151', 800: '#1f2937',
          900: '#111827', 950: '#030712',
        },
      },
      backgroundImage: {
        'genie-gradient': 'linear-gradient(135deg, #d0bcff 0%, #4edea3 100%)',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(208, 188, 255, 0.3)',
        'glow-secondary': '0 0 20px rgba(78, 222, 163, 0.3)',
        'ambient': '0 10px 40px -10px rgba(0, 0, 0, 0.5), 0 0 20px rgba(208, 188, 255, 0.05)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(10px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        glowPulse: { '0%, 100%': { opacity: '0.6' }, '50%': { opacity: '1' } },
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}

export default config
