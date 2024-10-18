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
    extend: {}
  },
  plugins: []
}
