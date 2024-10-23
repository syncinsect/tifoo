/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",
  content: [
    "./src/**/*.{ts,tsx,css,html}",
    "./assets/**/*.{html,js}",
    "./*.{ts,tsx,html}"
  ],
  // safelist: [
  //   {
  //     pattern: /.*/
  //   }
  // ],
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
      },
      borderWidth: {
        3: "3px"
      },
      borderStyle: {
        "dashed-large": "dashed 3px"
      },
      colors: {
        "tailware-blue": "#1DA1F2",
        "tailware-dark-blue": "#0C7ABF",
        "tailware-light-blue": "#E8F5FE"
      }
    }
  },
  variants: {},
  plugins: []
}
