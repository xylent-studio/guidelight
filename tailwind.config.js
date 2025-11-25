/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ========================================
        // Guidelight Semantic Color Tokens
        // All use HSL with alpha-value support
        // ========================================

        // Backgrounds
        'bg-app': 'hsl(var(--gl-bg-app) / <alpha-value>)',
        'bg-surface': 'hsl(var(--gl-bg-surface) / <alpha-value>)',
        'bg-elevated': 'hsl(var(--gl-bg-elevated) / <alpha-value>)',

        // Borders
        'border-subtle': 'hsl(var(--gl-border-subtle) / <alpha-value>)',
        'border-strong': 'hsl(var(--gl-border-strong) / <alpha-value>)',

        // Text
        'text-default': 'hsl(var(--gl-text-default) / <alpha-value>)',
        'text-muted': 'hsl(var(--gl-text-muted) / <alpha-value>)',
        'text-disabled': 'hsl(var(--gl-text-disabled) / <alpha-value>)',

        // Primary (brand green)
        primary: {
          DEFAULT: 'hsl(var(--gl-primary) / <alpha-value>)',
          hover: 'hsl(var(--gl-primary-hover) / <alpha-value>)',
          active: 'hsl(var(--gl-primary-active) / <alpha-value>)',
          soft: 'hsl(var(--gl-primary-soft) / <alpha-value>)',
          'soft-hover': 'hsl(var(--gl-primary-soft-hover) / <alpha-value>)',
          outline: 'hsl(var(--gl-primary-outline) / <alpha-value>)',
        },

        // Navigation
        nav: {
          bg: 'hsl(var(--gl-nav-bg) / <alpha-value>)',
          'item-active-bg': 'hsl(var(--gl-nav-item-active-bg) / <alpha-value>)',
          'item-active-text': 'hsl(var(--gl-nav-item-active-text) / <alpha-value>)',
          'item-inactive-text': 'hsl(var(--gl-nav-item-inactive-text) / <alpha-value>)',
        },

        // Chips / Pills
        chip: {
          'selected-bg': 'hsl(var(--gl-chip-selected-bg) / <alpha-value>)',
          'selected-border': 'hsl(var(--gl-chip-selected-border) / <alpha-value>)',
          'selected-text': 'hsl(var(--gl-chip-selected-text) / <alpha-value>)',
          'unselected-bg': 'hsl(var(--gl-chip-unselected-bg) / <alpha-value>)',
          'unselected-border': 'hsl(var(--gl-chip-unselected-border) / <alpha-value>)',
          'unselected-text': 'hsl(var(--gl-chip-unselected-text) / <alpha-value>)',
        },

        // Buttons
        btn: {
          'primary-bg': 'hsl(var(--gl-btn-primary-bg) / <alpha-value>)',
          'primary-bg-hover': 'hsl(var(--gl-btn-primary-bg-hover) / <alpha-value>)',
          'primary-bg-active': 'hsl(var(--gl-btn-primary-bg-active) / <alpha-value>)',
          'primary-text': 'hsl(var(--gl-btn-primary-text) / <alpha-value>)',
          'ghost-bg-hover': 'hsl(var(--gl-btn-ghost-bg-hover) / <alpha-value>)',
          'ghost-border': 'hsl(var(--gl-btn-ghost-border) / <alpha-value>)',
          'ghost-text': 'hsl(var(--gl-btn-ghost-text) / <alpha-value>)',
        },

        // Rating Stars
        star: {
          filled: 'hsl(var(--gl-star-filled) / <alpha-value>)',
          half: 'hsl(var(--gl-star-half) / <alpha-value>)',
          empty: 'hsl(var(--gl-star-empty) / <alpha-value>)',
        },

        // Keep legacy tokens for gradual migration (maps to new system)
        // These can be removed once all components are updated
        bg: 'hsl(var(--gl-bg-app) / <alpha-value>)',
        'bg-soft': 'hsl(var(--gl-bg-surface) / <alpha-value>)',
        surface: 'hsl(var(--gl-bg-surface) / <alpha-value>)',
        border: 'hsl(var(--gl-border-subtle) / <alpha-value>)',
        text: 'hsl(var(--gl-text-default) / <alpha-value>)',
        accent: 'hsl(var(--gl-primary) / <alpha-value>)',
      },
    },
  },
  plugins: [],
}
