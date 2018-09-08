const isProduction = process.env.NODE_ENV === 'production';

const devtool = isProduction ? undefined : 'inline-cheap-module-source-map';

module.exports = devtool;
