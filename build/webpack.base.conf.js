var path = require('path')
var utils = require('./utils')
var config = require('../config')
const fs = require('fs')
var ExtractTextPlugin = require('extract-text-webpack-plugin')

function resolve (dir) {
  return path.join(__dirname, '..', dir)
}
const srcPath = './src/js'
const entry = {}

const files = fs.readdirSync(resolve(srcPath))

files.forEach((file) => {
  if (!/.js$/.test(file)) {
    return
  }
  const fileName = file.replace(/\.js/, '')
  entry[fileName] = ['babel-polyfill'].concat([`${srcPath}/${file}`])
})

module.exports = {
  entry,
  output: {
    path: config.build.assetsRoot,
    filename: 'res/pc/static/js/[name].js',
    publicPath: process.env.NODE_ENV === 'production'
      ? config.build.assetsPublicPath
      : config.dev.assetsPublicPath,
      libraryTarget: 'var'
  },
  resolve: {
    extensions: ['.js', 'scss'],
    alias: {
      jquery: 'jquery/dist/jquery.min.js'
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'eslint-loader',
        enforce: 'pre',
        exclude:[resolve('src/vendor/layui')],
        include: [resolve('src')],
        options: {
          formatter: require('eslint-friendly-formatter')
        }
      },
      {
        test:/\.html$/,
        loader: 'html-loader',
        include:  [resolve('src')]
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [resolve('src'), resolve('node_modules')]
      },
      {
        test: /\.(css|scss)$/,
        loader: ExtractTextPlugin.extract({ fallback: 'style-loader', use: ['css-loader','postcss-loader','sass-loader'] }),
        include: [resolve('src'), resolve('node_modules')]
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('images/[name].[ext]')
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('fonts/[name].[ext]')
        }
      }
    ]
  }
}
