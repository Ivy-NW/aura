const { override, addBabelPlugins, babelInclude } = require('customize-cra');
const path = require('path');

module.exports = override(
  ...addBabelPlugins(
    ["@babel/plugin-proposal-class-properties", { "loose": true }],
    ["@babel/plugin-proposal-private-methods", { "loose": true }],
    ["@babel/plugin-proposal-private-property-in-object", { "loose": true }]
  ),
  babelInclude([
    path.resolve('src'), // Include your source code
    path.resolve('node_modules/africastalking') // Include the Africa's Talking SDK
  ])
);