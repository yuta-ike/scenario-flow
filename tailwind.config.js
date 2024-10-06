import plugin from 'tailwindcss'

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: "Helvetica Neue,Arial,Hiragino Kaku Gothic ProN,Hiragino Sans,Meiryo,sans-serif",
      },
      boxShadow: {
        object:
          "0 0 4px 0 rgba(0, 0, 0, 0.08), 0 1px 2px 0 rgba(0, 0, 0, 0.08)",
      },
      animation: {
        slideIn: "slideIn 0.2s linear",
        slideOut: "slideOut 0.2s linear",
        collapsibleSlideIn: "collapsibleSlideIn 0.5s ease-in-out",
        collapsibleSlideOut: "collapsibleSlideOut 0.5s ease-in-out",
        overlayShow: 'overlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1)',
        contentShow: 'contentShow 150ms cubic-bezier(0.16, 1, 0.3, 1)',
        drawerShow: 'drawerShow 300ms ease-in-out',
      },
      colors: {
        "base": "#171717"
      },
      keyframes: {
        drawerShow: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        }
      }
    },
  },
  plugins: [
    require("@tailwindcss/container-queries"),
    plugin(function ({ addUtilities }) {
      addUtilities({
        ".text-between": {
          "text-align": "justify",
          "text-align-last": "justify",
        }
      })
    })
  ],
}
