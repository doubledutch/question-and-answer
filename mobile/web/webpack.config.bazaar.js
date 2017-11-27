const path = require('path')
const webpack = require('webpack')

module.exports = {
  target: 'web',
  cache: false,
  debug: false,
  devtool: 'source-map',
  devServer: {
    contentBase: path.join(__dirname, 'static')
  },
  entry: [
    path.join(__dirname, '../index.bazaar.js')
  ],
  module: {
    loaders: [
      {
        test: /\.json$/,
        loader: 'json-loader'
      },
      {
        test: /\.js$/,
        // exclude node_modules except ES6 modules:   #TODO: use include for whitelist.
        exclude: /node_modules\/(?!(react-native-|apsl-react-native|bazaar-client)).*/,
        include: [
          path.resolve(__dirname, '../')
        ],
        loader: 'babel-loader',
        query: {
          cacheDirectory: true,
          babelrc: false, // ignore .babelrc because we can't use both "module-resolver" & webpack resolve
          presets: ['react-native'],
          plugins: ['transform-decorators-legacy']
        }
      }
    ]
  },
  output: {
    path: path.join(__dirname, '../web/static/build'),
    publicPath: '/build/',
    filename: 'bazaar-0.40.0.js',
    library: 'Bazaar'
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    }),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({ compress: { warnings: false } })
  ],
  resolve: {
    root: [
      path.resolve(__dirname, '../node_modules'),
    ],
    alias: {
      'react-native': 'react-native-web'
    },
    extensions: ['', '.js']
  },
  externals: {
    "react" : "window.React",
    "react-native" : "window.ReactNative"
  }
}
