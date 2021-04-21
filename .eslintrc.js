module.exports = {
  extends: './node_modules/@dydxprotocol/node-service-base-dev/.eslintrc.js',

  // Override the base configuration to set the correct tsconfigRootDir.
  parserOptions: {
    tsconfigRootDir: __dirname,
  },

  ignorePatterns: [
    '**/examples/**/*.js',
  ],

  // Extend the base rule set.
  rules: {
  },
};
