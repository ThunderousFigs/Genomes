var ManifestPlugin = require('webpack-manifest-plugin');
var webpack = require('Webpack');

var publicHost = 'http://localhost:2992';
var buildOutputPath = './build/public';
var rootAssetPath = './assets';

module.exports = {
  entry: {
    app: [
      'webpack/hot/dev-server',
      './client/entry.js'
    ]
  },
  output: {
    path: buildOutputPath,
    publicPath : publicHost + '/assets/',
    filename: 'main.js',
  },
  resolve: {
      // Avoid having to require files with an extension if they are here.
      extensions: ['', '.js', '.jsx', '.css']
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loaders: ['react-hot-loader', 'babel-loader'],
      }
    ]
  },
  plugins: [
    new ManifestPlugin(),
    new webpack.NoErrorsPlugin()
  ]
};