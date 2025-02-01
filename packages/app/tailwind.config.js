import base from "@scenario-flow/tailwind-config"

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../app/src/**/*{js,ts,jsx,tsx}",
    "../core/src/**/*{js,ts,jsx,tsx}",
    "../ui/src/**/*{js,ts,jsx,tsx}"
  ],
  presets: [base]
}
