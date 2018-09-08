const { resolve } = require('path');

const rules = require('./rules');
const plugins = require('./plugins');
const devServer = require('./dev-server');
const devtool = require('./devtool');
const optimization = require('./optimization');

const settings = plugins.then(plugins => (
  {
    resolve: {
      extensions: ['*', '.js', '.jsx', '.css', '.scss'],
    },
    context: resolve(__dirname, '..'),
    entry: {
      app: [
        'babel-polyfill',
        './src/index'
      ],
    },
    output: {
      filename: 'js/[name].[hash].js',
      path: resolve(__dirname, '..', 'public'),
    },
    module: {
      rules,
    },
    plugins,
    devServer,
    devtool,
    optimization,
    mode: process.env.NODE_ENV
  }
)).catch(e => {
  console.error(e)
})
module.exports = settings;


