/** @type {import('tailwindcss').Config} */
const plugin = require("tailwindcss/plugin");

module.exports = {
  prefix: "",
  mode: "jit",
  content: [
    "./src/**/*.{ts,tsx,css,html}",
    "./assets/**/*.{html,js}",
    "./*.{ts,tsx,html}",
  ],
  theme: {
    extend: {
      animation: {
        marquee: "marquee 10s linear infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translate(-50%, 1rem)" },
          "100%": { opacity: "1", transform: "translate(-50%, 0)" },
        },
        fadeOut: {
          "0%": { opacity: "1", transform: "translate(-50%, 0)" },
          "100%": { opacity: "0", transform: "translate(-50%, 1rem)" },
        },
      },
      borderWidth: {
        3: "3px",
      },
      borderStyle: {
        "dashed-large": "dashed 3px",
      },
      colors: {
        "tailware-blue": "#1DA1F2",
        "tailware-dark-blue": "#0C7ABF",
        "tailware-light-blue": "#E8F5FE",
      },
      fontFamily: {
        righteous: ["Righteous", "cursive"],
      },
      ringColor: {
        "tailware-blue": "#1DA1F2",
      },
      borderColor: {
        "tailware-blue": "#1DA1F2",
      },
    },
  },
  variants: {
    extend: {
      ringColor: ["focus"],
      borderColor: ["focus"],
    },
  },
  plugins: [
    require("tailwind-scrollbar")({ nocompatible: true }),
    plugin(function ({ addVariant }) {
      addVariant("tw", ["&.tw", ".tw &"]);
    }),
  ],
};
