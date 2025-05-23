const { override } = require('customize-cra');
const webpack = require('webpack');

module.exports = override((config) => {
  // 1. Add Node.js core module polyfills
  config.resolve.fallback = {
    ...config.resolve.fallback,
    http: require.resolve('stream-http'),
    https: require.resolve('https-browserify'),
    util: require.resolve('util/'),
    zlib: require.resolve('browserify-zlib'),
    stream: require.resolve('stream-browserify'),
    assert: require.resolve('assert/'),
    url: require.resolve('url/'),
    path: require.resolve('path-browserify'),
    os: require.resolve('os-browserify'),
    crypto: require.resolve('crypto-browserify'),
    fs: false,
    net: false,
    tls: false
  };

  // 2. Remove existing DefinePlugin to prevent conflicts
  config.plugins = config.plugins.filter(
    plugin => plugin.constructor.name !== 'DefinePlugin'
  );

  // 3. Add environment variable support
  const envVars = {
    // Include all REACT_APP_ variables
    ...Object.keys(process.env)
      .filter(key => key.startsWith('REACT_APP_'))
      .reduce((env, key) => {
        env[key] = JSON.stringify(process.env[key]);
        return env;
      }, {}),
    // Always include NODE_ENV
    NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development')
  };

  config.plugins.push(
    // 4. Add process and Buffer polyfills
    new webpack.ProvidePlugin({
      process: require.resolve('process/browser.js'),
      Buffer: ['buffer', 'Buffer']
    }),
    // 5. Add environment variables
    new webpack.DefinePlugin({
      'process.env': envVars
    })
  );

  return config;
});