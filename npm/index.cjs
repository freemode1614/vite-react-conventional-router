'use strict';

var fg = require('fast-glob');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var fg__default = /*#__PURE__*/_interopDefault(fg);

// src/index.ts
var PLUGIN_NAME = "react-conventional-router";
function ConventionalRouter(options) {
  if (!options) {
    options = { pages: [] };
  }
  let { pages = [] } = options;
  if (!Array.isArray(pages)) {
    pages = [pages];
  }
  const folders = fg__default.default.sync(pages, { deep: Infinity, markDirectories: true }).sort((a, b) => b.localeCompare(a, "en"));
  console.log("folders", folders);
  return {
    name: PLUGIN_NAME,
    buildStart: {
      order: "pre",
      handler() {
      }
    },
    load() {
    }
  };
}

module.exports = ConventionalRouter;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map