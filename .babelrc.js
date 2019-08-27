module.exports = {
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
  plugins: ['@babel/plugin-proposal-object-rest-spread'],
}
