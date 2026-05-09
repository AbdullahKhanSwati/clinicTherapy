const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configure to ignore TypeScript files in old directories
config.resolver.sourceExts = ['js', 'jsx', 'json'];
config.resolver.blacklistRE = /node_modules\/.*\.(ts|tsx)$/;

module.exports = config;
