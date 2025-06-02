const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Add fallbacks for Node.js core modules
  if (!config.resolve) {
    config.resolve = {};
  }
  if (!config.resolve.fallback) {
    config.resolve.fallback = {};
  }
  config.resolve.fallback.crypto = require.resolve('crypto-browserify');
  config.resolve.fallback.stream = require.resolve('stream-browserify');
  config.resolve.fallback.vm = require.resolve('vm-browserify');

  // Add alias for @react-native-vector-icons/get-image
  if (!config.resolve.alias) {
    config.resolve.alias = {};
  }
  // Setting to false tells webpack to treat it as an empty module,
  // which can resolve "Module not found" warnings for optional native modules.
  config.resolve.alias['@react-native-vector-icons/get-image'] = false;

  // Configure proxy for Netlify functions during development
  if (env.mode === 'development') {
    if (!config.devServer) {
      config.devServer = {};
    }
    config.devServer.proxy = {
      '/.netlify/functions': {
        target: 'http://localhost:9999', // Default port for `netlify functions:serve`
        secure: false, // Allow proxying to http
        // pathRewrite: { '^/.netlify/functions': '' }, // Usually not needed if functions are served with this prefix
      },
    };
    console.log('Webpack devServer proxy configured for Netlify functions on port 9999.');
  }

  return config;
};
