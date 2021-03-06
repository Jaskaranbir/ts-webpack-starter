const merge = require('webpack-merge')
const webpack = require('webpack')

const ForkTsCheckerPlugin = require('fork-ts-checker-webpack-plugin')
const HardSourcePlugin = require('hard-source-webpack-plugin')
const StartServerPlugin = require('start-server-webpack-plugin')

const nodeExternals = require('webpack-node-externals')

const baseConfig = require('./webpack.config.base')
const config = require('./config')

const baseEntries = Object.keys(config.common.entry)
// Add Webpack HMR-polling to every entry
const entries = Object.entries(config.common.entry).reduce(
    (out, [entryKey, entryValue]) => ({
        ...out,
        [entryKey]: ["webpack/hot/poll?1000", entryValue]
    }),
    {}
);

module.exports = merge(baseConfig, {
  entry: entries,

  output: {
    pathinfo: false
  },

  devtool: 'inline-source-map',
  mode: 'development',
  watch: true,

  externals: [
    nodeExternals({
      whitelist: ['webpack/hot/poll?1000']
    })
  ],

  optimization: {
    namedModules: false,
    removeAvailableModules: false,
    removeEmptyChunks: false,
    minimize: false
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              experimentalWatchApi: true
            }
          }
        ]
      }
    ]
  },

  plugins: [
    new ForkTsCheckerPlugin({
      async: true,
      checkSyntacticErrors: true,
      formatter: 'codeframe',
      tslint: true,
      tslintAutoFix: true,
      useTypescriptIncrementalApi: true,
      watch: config.dev.tsCheckerWatch
    }),

    new StartServerPlugin('main.js'),

    new HardSourcePlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin(config.dev.env),
    new webpack.WatchIgnorePlugin([
      /\.js$/,
      /\.d\.ts$/
    ])
  ]
})
