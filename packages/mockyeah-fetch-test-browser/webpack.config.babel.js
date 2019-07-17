import HtmlWebpackPlugin from 'html-webpack-plugin';

const common = filename => ({
  mode: 'development',
  output: {
    filename: `${filename}.js`
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: `${filename}.html`
    })
  ]
});

export default [
  {
    ...common('index'),
    entry: './src/index.js'
  },
  {
    ...common('custom'),
    entry: './src/custom.js'
  }
];
