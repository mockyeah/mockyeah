import nodeExternals from 'webpack-node-externals';

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

export default [
  {
    ...common,
    entry: './src/normalize.js',
    target: 'node',
    externals: [nodeExternals()],
    output: {
      filename: 'normalize.js',
      libraryTarget: 'commonjs2',
      libraryExport: 'default'
    }
  },
  {
    ...common,
    target: 'node',
    externals: [nodeExternals()],
    output: {
      libraryTarget: 'commonjs2',
      libraryExport: 'default'
    }
  },
  {
    ...common,
    output: {
      filename: 'browser.js',
      library: 'Mockyeah',
      libraryTarget: 'var',
      libraryExport: 'default'
    }
  }
];
