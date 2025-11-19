/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Guidelight semantic tokens
        bg: 'var(--gl-bg)',
        'bg-soft': 'var(--gl-bg-soft)',
        surface: 'var(--gl-surface)',
        border: 'var(--gl-border)',
        text: 'var(--gl-text)',
        'text-muted': 'var(--gl-text-muted)',
        primary: {
          DEFAULT: 'var(--gl-primary)',
          soft: 'var(--gl-primary-soft)',
          foreground: 'var(--gl-primary-foreground)',
        },
        accent: 'var(--gl-accent)',
      },
    },
  },
  plugins: [],
}

