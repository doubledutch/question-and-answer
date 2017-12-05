const webpack = require('webpack')
const devConfig = require('./webpack.config.dev')
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const prodConfig = {
  target: 'web',
  cache: false,
  debug: false,
  devtool: 'source-map'
}
Object.assign(prodConfig, devConfig)

prodConfig.externals = {
  "react": "window.React",
  "react-dom": "window.ReactDom",
  "react-native": "window.ReactNative"
}

prodConfig.plugins = [
  // #FIXME: setting NODE_ENV to production will cause JS error:
  // style is undefined in react-native-tab-navigator/Tab.js: titleStyle: Text.propTypes.style
  // new webpack.DefinePlugin({
  //   'process.env': {
  //     NODE_ENV: JSON.stringify('production')
  //   }
  // }),
  new webpack.NormalModuleReplacementPlugin(/\.\/ActionSheet$/,  function(resource) {
    resource.request = __dirname + '/../ActionSheet.web.js'
  }),
  new webpack.NormalModuleReplacementPlugin(/react-native-action-sheet$/,  function(resource) {
    resource.request = __dirname + '/../ActionSheet.web.js'
  }),
  new webpack.NormalModuleReplacementPlugin(/^moment$/,  function(resource) {
   resource.request = __dirname + '/../resolver-overloads/moment/min/moment-with-locales.min.js'
  }),
  new webpack.NormalModuleReplacementPlugin(/^moment\/min\/moment-with-locales.min$/,  function(resource) {
   resource.request = __dirname + '/../resolver-overloads/moment/min/moment-with-locales.min.js'
  }),
  new webpack.DefinePlugin({
  }),
  new webpack.optimize.DedupePlugin(),
  new webpack.optimize.OccurrenceOrderPlugin(),
  new webpack.optimize.UglifyJsPlugin({ compress: { warnings: false } }),
  //new BundleAnalyzerPlugin()
]

module.exports = prodConfig