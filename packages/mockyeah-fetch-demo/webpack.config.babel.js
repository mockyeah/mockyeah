const HtmlWebpackPlugin = require('html-webpack-plugin');

const defaults = (env = {}) => ({
  mode: env.dev ? 'development' : 'production',
  devtool: env.dev ? 'source-map' : undefined,
  resolve: {
    extensions: ['.ts', '.js', '.json'],
    // The '..' supports resolving packages for monorepo build on netlify
    //  which doesn't seem to allow `lerna link`'s writes to `node_modules`.
    modules: ['node_modules', '..']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      },
      {
        test: /\.js$/,
        use: 'source-map-loader',
        enforce: 'pre'
      }
    ]
  }
});

export default [
  (env = {}) => ({
    ...defaults(env),
    entry: './src/index.ts',
    plugins: [
      new HtmlWebpackPlugin({
        title: '@mockyeah/fetch demo'
      })
    ]
  }),
  (env = {}) => ({
    ...defaults(env),
    entry: '@mockyeah/fetch/dist/serviceWorker',
    output: {
      filename: '__mockyeahServiceWorker.js'
    }
  })
];
