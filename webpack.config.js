const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const AssetsPlugin = require('assets-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const path = require('path')
const webpack = require('webpack')

const isProd = process.env.NODE_ENV === 'production'

// Can't print when using dependency-cruiser.
// console.log('webpack config: NODE_ENV=' + process.env.NODE_ENV)

const minimizers = []
if (isProd) {
  minimizers.push(new OptimizeCSSAssetsPlugin())
}

module.exports = {
  mode: isProd ? 'production' : 'development',
  // devtool: isProd ? false : 'source-map',
  target: 'web',
  entry: {
    login: './src/public/js/login.ts',
    main: './src/public/js/main.ts',
    planning: './src/public/js/planning.ts'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            plugins: ['babel-plugin-transform-class-properties'],
            presets: [
              '@babel/typescript',
              [
                '@babel/env',
                {
                  modules: 'auto'
                }
              ]
            ]
          }
        }
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          'css-loader'
        ]
      },
      {
        test: /\.s[a|c]ss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          {
            loader: 'css-loader',
            options: { sourceMap: !isProd }
          },
          {
            loader: 'resolve-url-loader',
            options: {
              sourceMap: !isProd
            }
          },
          {
            loader: 'sass-loader',
            options: {
              // need to be true for resolve-url-loader to work
              sourceMap: true
            }
          }
        ]
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        loader: 'file-loader',
        options: {
          name: '[name].[contenthash].[ext]',
          outputPath: 'images/'
        }
      },
      {
        // exposing jQuery in window.$ and window.jQuery
        test: require.resolve('jquery'),
        use: [
          {
            loader: 'expose-loader',
            options: '$'
          },
          {
            loader: 'expose-loader',
            options: 'jQuery'
          }
        ]
      },
      {
        test: /\.njk$/,
        loader: 'nunjucks-loader'
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  plugins: [
    new CleanWebpackPlugin(),
    new AssetsPlugin({
      filename: 'assets.json',
      includeManifest: true,
      manifestFirst: true,
      path: path.join(__dirname, 'dist'),
      prettyPrint: !isProd
    }),
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash].css'
    }),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': "jquery'",
      'window.$': 'jquery'
    })
  ],
  optimization: {
    splitChunks: {
      chunks: 'all',
      maxSize: 244000,
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name (module, chunks, cacheGroupKey) {
            const moduleFileName = module.identifier().split('/').reduceRight(item => item)
            const allChunksNames = chunks.map((item) => item.name).join('~')
            return `${cacheGroupKey}-${allChunksNames}-${moduleFileName}`
          },
          chunks: 'all'
        }
      }
    },
    runtimeChunk: {
      name: 'manifest'
    },
    minimizer: minimizers
  },
  output: {
    filename: 'js/[name].[contenthash].js',
    publicPath: '/',
    path: path.join(__dirname, 'dist/public/')
  }
}
