/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",
  content: [
    "./src/**/*.{ts,tsx,css,html}",
    "./assets/**/*.{html,js}",
    "./*.{ts,tsx,html}"
  ],
  theme: {
    extend: {
      animation: {
        marquee: "marquee 10s linear infinite"
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" }
        }
      }
    }
  },
  variants: {
    extend: {
      animation: ["group-hover", "group-focus"]
    }
  },
  plugins: []
}
