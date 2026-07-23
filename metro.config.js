const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Bundle 3D model files (the brain GLB used by Brain3D) and raw HTML activities
// (the Collaborative Sandbox game loaded into a WebView).
config.resolver.assetExts.push('glb', 'gltf', 'html');

module.exports = config;
