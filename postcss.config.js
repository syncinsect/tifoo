module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    "postcss-prefix-selector": {
      prefix: "[data-tw-ext]",
      transform(prefix, selector) {
        if (selector.match(/^(html|body)/)) {
          return selector;
        }
        return `${prefix} ${selector}`;
      },
      includeFiles: [/\.css$/],
    },
  },
};
