export default {
  mode: 'development',
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
  output: {
    library: 'matchDeep',
    libraryTarget: 'commonjs2',
    libraryExport: 'default'
  }
};
