const { join } = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const precss = require('precss');
const postcssCssnext = require('postcss-cssnext');

const devMode = process.env.NODE_ENV === 'development';

const miniCssLoader = {
  loader: MiniCssExtractPlugin.loader,
    options: {
        publicPath: '../public/css'
    }
}

const rules = [{
  test: /.jsx?$/,
  loader: 'babel-loader',
  exclude: /node_modules/,
}, {
  test: /\.s?css$/,
  use: [
    devMode ? 'style-loader' : miniCssLoader,
    {
      loader: 'css-loader',
      options: {
        sourceMap: true,
        importLoaders: 2,
      },
    },
    {
      loader: 'postcss-loader',
      options: {
        sourceMap: true,
        plugins() {
          return [
            precss,
            postcssCssnext,
          ];
        },
      }
    },
    {
      loader: 'sass-loader',
      options: {
        sourceMap: true,
      },
    }],
},{
  test: /\.(woff2|woff|ttf|eot|svg)(\?.*$|$)/,
  loader: 'file-loader?name=fonts/[name].[ext]',
  include: [
    join(__dirname, 'src'),
    join(__dirname, 'node_modules'),
  ],
}, {
  test: /\.(jpg|jpeg|gif|png|ico|svg)(\?.*$|$)$/,
  loader: 'file-loader?name=img/[name].[ext]',
}];

module.exports = rules;
