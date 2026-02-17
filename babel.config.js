module.exports = function(api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { unstable_transformImportMeta: true }]
    ],
    plugins: [
        // Ensure that any ESM specific syntax like import.meta is handled
    ],
  };
};
