const path = require('path');

module.exports = {
  entry: path.resolve(__dirname, "src/index.js"),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'ensuredata.js',
    library: '$',
    libraryTarget: 'umd',
  },
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: "babel-loader",
      }
    ]
  },
  devtool: 'inline-source-map',
  mode: "development"
}
