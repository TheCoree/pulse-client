import type { Config } from "tailwindcss"

export default {
  content: [
  "./app/**/*.{ts,tsx}",
  "./components/**/*.{ts,tsx}",
  "./src/**/*.{ts,tsx}",
],

  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-sora)'],
      },
    },
  },
  // plugins: []  ← пусто или другие плагины, но НЕ animate
} satisfies Config