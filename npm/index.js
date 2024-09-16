// src/index.ts
var PLUGIN_NAME = "react-conventional-router";
function ConventionalRouter() {
  return {
    name: PLUGIN_NAME,
    buildStart: {
      order: "pre",
      handler() {
        console.log(`${PLUGIN_NAME}-> buildStart`);
        this.info(`${PLUGIN_NAME}-> buildStart`);
      }
    }
  };
}

export { ConventionalRouter as default };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map