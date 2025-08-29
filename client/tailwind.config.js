// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', 'ui-sans-serif', 'system-ui'],
        'serif': ['Merriweather', 'ui-serif', 'Georgia'],
        'mono': ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular'],
      },
      backgroundImage: {
        'paper': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f9f9f9' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.02'/%3E%3C/svg%3E\")"
      }
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        paper: {
          "primary": "#1a1a1a",
          "secondary": "#404040",
          "accent": "#666666",
          "neutral": "#2a2a2a",
          "base-100": "#fefefe",
          "base-200": "#f8f8f8",
          "base-300": "#f0f0f0",
          "info": "#3abff8",
          "success": "#36d399",
          "warning": "#fbbd23",
          "error": "#f87272",
        },
      },
      {
        dark: {
          "primary": "#fefefe",
          "secondary": "#d4d4d4",
          "accent": "#a3a3a3",
          "neutral": "#2a2a2a",
          "base-100": "#1a1a1a",
          "base-200": "#2a2a2a",
          "base-300": "#3a3a3a",
          "info": "#3abff8",
          "success": "#36d399",
          "warning": "#fbbd23",
          "error": "#f87272",
        },
      }
    ],
  },
}