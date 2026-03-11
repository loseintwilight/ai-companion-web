const path = require('path');

module.exports = function override(config, env) {
  // 配置 webpack fallback，解决 Node.js 模块在浏览器中的 polyfill 问题
  config.resolve.fallback = {
    fs: false,
    path: require.resolve('path-browserify'),
    os: require.resolve('os-browserify/browser'),
    crypto: require.resolve('crypto-browserify'),
    stream: require.resolve('stream-browserify'),
    buffer: require.resolve('buffer/'),
    http: require.resolve('stream-http'),
    https: require.resolve('https-browserify'),
    url: require.resolve('url/'),
    zlib: require.resolve('browserify-zlib'),
    util: require.resolve('util/'),
    process: require.resolve('process/browser')
  };

  return config;
};
