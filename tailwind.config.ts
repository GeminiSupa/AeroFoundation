import tailwindcssAnimate from 'tailwindcss-animate'; // <-- Use import

const config = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './index.html',
  ],
  theme: {
    // ... all your theme settings ...
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // Legacy shadcn colors for compatibility
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // SAP Fiori semantic colors
        'sap-positive': 'var(--sapPositiveColor)',
        'sap-negative': 'var(--sapNegativeColor)',
        'sap-critical': 'var(--sapCriticalColor)',
        'sap-informative': 'var(--sapInformativeColor)',
        'sap-neutral': 'var(--sapNeutralColor)',
        'sap-brand': 'var(--sapBrandColor)',
        'sap-text': 'var(--sapTextColor)',
        'sap-text-secondary': 'var(--sapSecondaryTextColor)',
        'sap-shell': 'var(--sapShell_Background)',
        'sap-list': 'var(--sapList_Background)',
        'sap-tile': 'var(--sapTile_Background)',
        // Role-based colors
        'role-admin': 'var(--role-admin)',
        'role-teacher': 'var(--role-teacher)',
        'role-student': 'var(--role-student)',
        'role-parent': 'var(--role-parent)',
        // Module-based colors
        'module-hr': 'var(--module-hr)',
        'module-inventory': 'var(--module-inventory)',
        'module-ai': 'var(--module-ai)',
        'module-classes': 'var(--module-classes)',
        'module-scheduling': 'var(--module-scheduling)',
        'module-leave': 'var(--module-leave)',
        'module-finance': 'var(--module-finance)',
        'module-reports': 'var(--module-reports)',
        'module-audit': 'var(--module-audit)',
        'module-announcements': 'var(--module-announcements)',
        'module-messages': 'var(--module-messages)',
        'module-settings': 'var(--module-settings)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        'sap-depth': 'var(--sapShadow_Depth)',
        'sap-header': 'var(--sapShadow_Depth_Header)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [tailwindcssAnimate], // <-- Use the imported plugin
};

export default config;