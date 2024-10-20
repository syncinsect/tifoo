/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./**/*.{ts,tsx}"],
  safelist: [
    {
      pattern: /./ // "." matches all content
      // variants: ["sm", "md", "lg", "xl", "2xl"] // you can add the variants you need here
    }
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
