const path = require('path');

module.exports = {
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: [
          /node_modules/,
          /__tests__/,
          /\.d\.ts$/,
        ],
        use: [
          'babel-loader',
          'ts-loader',
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'jivescript.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'JiveScript',
    libraryExport: 'default',
    libraryTarget: 'umd',
    umdNamedDefine: true,
    globalObject: "typeof self !== 'undefined' ? self : this",
  },
};
