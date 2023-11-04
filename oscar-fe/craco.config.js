const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Modify the 'include' property for the JS/TS loader
      const rule = webpackConfig.module.rules.find(
        (r) => r.oneOf && r.oneOf.some((rule) => rule.loader && rule.loader.includes('babel-loader'))
      );

      if (rule && rule.oneOf) {
        const babelLoader = rule.oneOf.find((rule) => rule.loader && rule.loader.includes('babel-loader'));
        if (babelLoader) {
          // Add your directory path here
          babelLoader.include = [babelLoader.include, path.resolve(__dirname, '../shared')];
        }
      }

      return webpackConfig;
    }
  }
};
