import nodeExternals from 'webpack-node-externals';

const common = {
  mode: 'production',
  entry: './src/index.ts',
  resolve: {
    extensions: ['.ts', '.js', '.json']
  },
  module: {
    rules: [
      {
        test: /\.[jt]s$/,
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
    entry: './src/normalize.ts',
    target: 'node',
    externals: [nodeExternals()],
    output: {
      filename: 'normalize.ts',
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
