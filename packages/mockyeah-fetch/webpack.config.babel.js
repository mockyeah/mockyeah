const common = {
  mode: 'production',
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
  }
};

module.exports = [
  {
    ...common,
    output: {
      ...common.output,
      library: 'mockyeahFetch'
    }
  },
  {
    ...common,
    entry: './src/proxy.js',
    output: {
      ...common.output,
      library: 'mockyeahFetchProxy',
      path: __dirname,
      filename: 'proxy.js'
    }
  }
];
