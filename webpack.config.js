const { resolve } = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
  mode: 'development',
  entry: { index: './src/index.jsx' },
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
            test: /\.(js|jsx)$/,
            use: ['babel-loader'],
            exclude: '/node_modules',
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
    new CleanWebpackPlugin(),
  ],
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      noact: resolve(__dirname, './noact'),
    },
  },
  devtool: 'inline-source-map',
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
