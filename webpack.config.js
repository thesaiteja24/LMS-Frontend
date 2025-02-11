const path = require('path');
const PurgeCSSPlugin = require('purgecss-webpack-plugin');
const glob = require('glob-all');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  mode: 'production', 
  entry: './src/index.js', 
  output: {
    filename: 'bundle.js', 
    path: path.resolve(__dirname, 'dist'), 
  },
  module: {
    rules: [
      {
        test: /\.css$/, 
        use: [
          MiniCssExtractPlugin.loader, 
          'css-loader', 
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css', 
    }),
    new PurgeCSSPlugin({
      paths: glob.sync(path.join(__dirname, 'src/**/*.{html,js,jsx,ts,tsx}')), 
    }),
  ],
};
