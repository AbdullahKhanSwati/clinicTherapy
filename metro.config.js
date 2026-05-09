const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.blockList = [
  new RegExp(`${path.resolve(__dirname, 'components').replace(/\\/g, '\\\\')}/.*`),
  new RegExp(`${path.resolve(__dirname, 'styles').replace(/\\/g, '\\\\')}/.*`),
  new RegExp(`${path.resolve(__dirname, 'public').replace(/\\/g, '\\\\')}/.*`),
];

module.exports = config;
