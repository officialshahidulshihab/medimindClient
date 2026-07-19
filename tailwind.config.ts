import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy:    '#0B1426',
        surface: '#111E36',
        elevated:'#162040',
        teal:    '#00C9B1',
        muted:   '#A8B4CC',
        border:  '#4D607F',
        danger:  '#FF4D6A',
        warning: '#FFB545',
        success: '#00D68F',
        info:    '#4D94FF',
      },
      fontFamily: {
        sora:  ['var(--font-sora)', 'sans-serif'],
        inter: ['var(--font-inter)', 'sans-serif'],
        mono:  ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-dot': 'pulse 2s ease-in-out infinite',
        'shimmer':   'shimmer 1.4s infinite',
        'ai-glow':   'aiGlow 3s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
