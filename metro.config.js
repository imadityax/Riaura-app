const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Bundle 3D model files (the brain GLB used by Brain3D).
config.resolver.assetExts.push('glb', 'gltf');

module.exports = config;
