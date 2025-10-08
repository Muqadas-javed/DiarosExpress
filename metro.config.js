const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const defaultConfig = getDefaultConfig(__dirname);

// 👇 Extend the resolver to support mp3 files
defaultConfig.resolver.assetExts.push('wav'); // 👈 Add wav support

const config = {};

module.exports = mergeConfig(defaultConfig, config);
