const path = require('path')
const webpack = require('webpack')
const PathOverridePlugin = require('path-override-webpack-plugin')

module.exports = {
  devServer: {
    contentBase: path.join(__dirname, 'static')
  },
  entry: [
    path.join(__dirname, '../index.web.js')
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
        exclude: /node_modules\/(?!(react-native-|apsl-react-native|\@exponent|react-clone-referenced-element|react-navigation)).*/,
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
      },
      { test: /\.(jpe?g|png|gif|svg)$/i, loader: "file-loader?name=public/icons/[name].[ext]" }
    ]
  },
  output: {
    path: path.join(__dirname, '../web/static/build'),
    publicPath: 'build/',
    filename: 'bundle.js'
  },
  plugins: [
    new webpack.NormalModuleReplacementPlugin(/\.\/ActionSheet$/, function (resource) {
      resource.request = __dirname + '/../ActionSheet.web.js'
    }),
    new webpack.NormalModuleReplacementPlugin(/^moment$/,  function(resource) {
    resource.request = __dirname + '/../resolver-overloads/moment/min/moment-with-locales.min.js'
    }),
    new webpack.NormalModuleReplacementPlugin(/^moment\/min\/moment-with-locales.min$/,  function(resource) {
    resource.request = __dirname + '/../resolver-overloads/moment/min/moment-with-locales.min.js'
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    }),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin()
  ],
  resolve: {
    root: [
      path.resolve(__dirname, '../node_modules'),
    ],
    alias: {
      'react-native': 'react-native-web'
    },
    extensions: ['', '.web.js', '.js']
  }, externals: {
    "react": "window.React",
    "react-dom": "window.ReactDom",
    "react-native": "window.ReactNative",
  }
}
