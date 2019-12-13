const HtmlWebpackPlugin = require('html-webpack-plugin');

export default (env = {}) => ({
  mode: env.dev ? 'development' : 'production',
  devtool: env.dev ? 'source-map' : undefined,
  entry: './src/index.ts',
  resolve: {
    extensions: ['.ts', '.js', '.json']
  },
  module: {
    rules: [
      {
        test: /\.[jt]s$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      },
      {
        test: /\.js$/,
        use: 'source-map-loader',
        enforce: 'pre'
      }
    ]
  },
  plugins: [new HtmlWebpackPlugin()]
});
