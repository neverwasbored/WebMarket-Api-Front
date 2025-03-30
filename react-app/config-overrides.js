module.exports = {
    webpack: (config, env) => {
      config.resolve.fallback = {
        buffer: false,  // Отключаем buffer
        crypto: false,  // Отключаем crypto
        path: false,    // Отключаем path
        os: false,      // Отключаем os
      };
      return config;
    },
  };