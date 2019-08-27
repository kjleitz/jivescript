const path = require('path');

module.exports = {
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                [
                  "@babel/env",
                  {
                    targets: {
                      browsers: "> 1% in US",
                    },
                    useBuiltIns: "usage",
                  },
                ],
              ],
              plugins: ['@babel/plugin-proposal-object-rest-spread']
            }
          },
          {
            loader: 'ts-loader',
          },
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
