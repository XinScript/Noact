const { resolve } = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssPlugin = require('optimize-css-assets-webpack-plugin')
const EslintWebpackPlugin = require('eslint-webpack-plugin')

module.exports = {
  mode: 'development',
  entry: { index: './src/index.js' },
  output: {
    filename: '[name].[hash:10].js',
    path: resolve(__dirname, 'dist'),
    assetModuleFilename: 'assets/[name].[hash:10][ext]',
  },
  module: {
    rules: [
      {
        oneOf: [
          {
            test: /\.(less|css)$/,
            use: [
              MiniCssExtractPlugin.loader,
              'css-loader',
              {
                loader: 'postcss-loader',
                options: {
                  postcssOptions: {
                    plugins: ['postcss-preset-env'],
                  },
                },
              },
              'less-loader',
            ],
          },
          // {
          //   test: /\.js$/,
          //   exclude: '/node_modules',
          //   loader: 'babel-loader',
          //   options: {
          //     presets: [['@babel/preset-env', { useBuiltIns: 'usage', corejs: { version: 3 } }]],
          //     cacheDirectory: true,
          //     // plugins: ['@babel/plugin-transform-runtime', { corejs: 3 }],
          //   },
          // },
          {
            test: /\.(js|jsx)$/,
            use: ['babel-loader'],
            exclude: '/node_modules',
          },
          {
            test: /\.(png|jpg|jpeg)/,
            type: 'asset',
          },
          // {
          //   loader: 'url-loader',
          //   options: {
          //     /**
          //      * 小于8MB，转为base64到行内元素,
          //      * 优点：减少请求数量
          //      * 缺点：体积会更大
          //      */
          //     limit: 1000 * 1024,
          //     esModule: false,
          //     name: '[hash:10].[ext]',
          //   },
          // },
          //   {
          //     exclude: /\.(css|less|html|js$)/,
          //     loader: 'file-loader',
          //     options: {
          //       name: '[name].[hash:10].[ext]',
          //     },
          //   },
          {
            test: /\.html$/,
            loader: 'html-loader',
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      inject: 'body',
      minify: {
        collapseWhitespace: true,
        removeComments: true,
      },
    }),

    // new EslintWebpackPlugin({
    //   exclude: '/node_modules',
    //   fix: true,
    // }),
    new MiniCssExtractPlugin({
      filename: 'css/[name].[hash:10].css',
    }),
    new OptimizeCssPlugin(),
    new CleanWebpackPlugin(),
  ],
  devtool: 'source-map',
  devServer: {
    compress: true,
    port: 8080,
    open: true,
    hot: true,
  },
  optimization: {
    usedExports: true,
    splitChunks: {
      chunks: 'all',
    },
  },
}
