const { resolve, join } = require('path');
const webpack = require('webpack');
const git = require('git-rev');
const packageJson = require('../package');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const isProduction = process.env.NODE_ENV === 'production';

const public = 'public';

// the path(s) that should be cleaned
const pathsToClean = [
  `${public}/**/*.*`,
];

// the clean options to use
const cleanOptions = {
  root: resolve(__dirname, '..'),
  exclude: [`${public}/.gitignore`],
  verbose: true,
  dry: false,
};

const plugins = [
  new webpack.EnvironmentPlugin(['NODE_ENV','ETH_NET']),
  new CleanWebpackPlugin(pathsToClean, cleanOptions),
  new webpack.NamedModulesPlugin(),
];

if (isProduction) {
  plugins.push(
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false,
    }),
    new OptimizeCSSAssetsPlugin(),
    new webpack.IgnorePlugin(/^\.\/locale$/),
    new MiniCssExtractPlugin({
        filename: 'css/[contenthash].css',
        chunkFilename: 'css/[contenthash].css',
    }),
  );

} else {
  plugins.push(
    new webpack.LoaderOptionsPlugin({
      debug: true,
    }),
    new BundleAnalyzerPlugin({
        analyzerMode: 'server',
        defaultSizes: 'parsed',
        openAnalyzer: false
    }),
    new webpack.HotModuleReplacementPlugin(),
  );
}


module.exports = new Promise((resolve) => {
  git.short(function (commit) {
    const htmlPlugin = new HtmlWebpackPlugin({
      template: join('src', 'index.html'),
      meta: {
        version: packageJson.version,
        'git-rev': commit
      }
    })
    resolve([...plugins, htmlPlugin])
  })
});
