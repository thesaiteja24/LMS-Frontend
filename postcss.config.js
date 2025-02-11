module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    '@fullhuman/postcss-purgecss': {
      content: ['./src/**/*.{html,js,jsx,ts,tsx}'], 
      defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
      safelist: [], 
    },
  },
};
