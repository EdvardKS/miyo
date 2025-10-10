/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          100: 'var(--ec-brand-100)',
          400: 'var(--ec-brand-400)',
          500: 'var(--ec-brand-500)',
          600: 'var(--ec-brand-600)',
          DEFAULT: 'var(--ec-brand-500)',
        },
        surface: {
          DEFAULT: 'var(--ec-surface)',
          elevated: 'var(--ec-surface-elevated)',
          muted: 'var(--ec-surface-muted)',
        },
        base: {
          DEFAULT: 'var(--ec-bg-body)',
          subtle: 'var(--color-background-subtle)',
        },
        content: {
          DEFAULT: 'var(--ec-text-primary)',
          secondary: 'var(--ec-text-secondary)',
          muted: 'var(--ec-text-muted)',
          inverted: 'var(--color-content-inverted)',
        },
        outline: 'var(--color-border)',
        accent: {
          DEFAULT: 'var(--color-accent)',
          foreground: 'var(--color-on-accent)',
          subtle: 'var(--color-accent-subtle)',
        },
        success: 'var(--ec-success-500)',
        info: 'var(--ec-info-500)',
        warning: 'var(--ec-warning-500)',
        danger: 'var(--ec-danger-500)',
      },
      backgroundImage: {
        'app-gradient': 'var(--gradient-app)',
        'panel-glow': 'var(--gradient-panel)',
      },
      boxShadow: {
        'soft': 'var(--shadow-soft)',
        'focus': '0 0 0 3px rgba(244, 167, 35, 0.35)',
      },
      borderRadius: {
        xl: '1.25rem',
        '2xl': '1.75rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
