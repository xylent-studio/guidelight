/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ========================================
        // Guidelight-Specific Tokens
        // These EXTEND shadcn's standard tokens
        // 
        // Standard shadcn tokens (bg-background, bg-card, text-foreground, etc.)
        // are defined in index.css and work automatically.
        // 
        // The tokens below are Guidelight-specific additions.
        // ========================================

        // Rating Stars (Guidelight-specific)
        star: {
          filled: 'hsl(var(--gl-star-filled) / <alpha-value>)',
          half: 'hsl(var(--gl-star-half) / <alpha-value>)',
          empty: 'hsl(var(--gl-star-empty) / <alpha-value>)',
        },

        // Category Chips / Pills (Guidelight-specific)
        chip: {
          'selected-bg': 'hsl(var(--gl-chip-selected-bg) / <alpha-value>)',
          'selected-border': 'hsl(var(--gl-chip-selected-border) / <alpha-value>)',
          'selected-text': 'hsl(var(--gl-chip-selected-text) / <alpha-value>)',
          'unselected-bg': 'hsl(var(--gl-chip-unselected-bg) / <alpha-value>)',
          'unselected-border': 'hsl(var(--gl-chip-unselected-border) / <alpha-value>)',
          'unselected-text': 'hsl(var(--gl-chip-unselected-text) / <alpha-value>)',
        },

        // Button Variants (extends shadcn Button)
        btn: {
          'primary-bg': 'hsl(var(--gl-btn-primary-bg) / <alpha-value>)',
          'primary-bg-hover': 'hsl(var(--gl-btn-primary-bg-hover) / <alpha-value>)',
          'primary-bg-active': 'hsl(var(--gl-btn-primary-bg-active) / <alpha-value>)',
          'primary-text': 'hsl(var(--gl-btn-primary-text) / <alpha-value>)',
          'ghost-bg-hover': 'hsl(var(--gl-btn-ghost-bg-hover) / <alpha-value>)',
          'ghost-border': 'hsl(var(--gl-btn-ghost-border) / <alpha-value>)',
          'ghost-text': 'hsl(var(--gl-btn-ghost-text) / <alpha-value>)',
        },
      },
    },
  },
  plugins: [],
}
