const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
    },
    viewportHeight: 1080,
    viewportWidth: 1920,
    blockHosts: ["*mc.yandex.ru"],
    baseUrl:"https://pokemonbattle.ru"
  },
});
