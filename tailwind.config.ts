import type { Config } from 'tailwindcss';

const v = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: '6px',
        xl: '8px',
        '2xl': '10px',
      },
      colors: {
        brand: { DEFAULT: v('brand'), hover: v('brand-hover'), soft: v('brand-soft') },
        'on-brand': v('on-brand'),
        'type-regular': { soft: v('type-regular-soft'), ink: v('type-regular-ink') },
        'type-shift': { soft: v('type-shift-soft'), ink: v('type-shift-ink') },
        'type-cycle': { soft: v('type-cycle-soft'), ink: v('type-cycle-ink') },
        canvas: v('canvas'),
        surface: { DEFAULT: v('surface'), 2: v('surface-2') },
        field: v('field'),
        ink: v('ink'),
        body: v('body'),
        muted: v('muted'),
        subtle: v('subtle'),
        line: v('line'),
        present: { DEFAULT: '#3f9d6f', soft: v('present-soft'), ink: v('present-ink') },
        late: { DEFAULT: '#cc8f33', soft: v('late-soft'), ink: v('late-ink') },
        absent: { DEFAULT: '#d0584f', soft: v('absent-soft'), ink: v('absent-ink') },
        leave: { DEFAULT: '#7d70c8', soft: v('leave-soft'), ink: v('leave-ink') },
      },
      gridTemplateColumns: {
        14: 'repeat(14, minmax(0, 1fr))',
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.04)',
      },
    },
  },
  plugins: [],
};

export default config;
