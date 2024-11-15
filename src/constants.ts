import nodepath from "node:path";

export const DEFAULT_IGNORE_PATTERN = ["node_modules/**"];
export const PLUGIN_NAME = "vite-plugin-conventional-router";
export const PLUGIN_VIRTUAL_MODULE_NAME = "virtual:routes";
export const PLUGIN_MAIN_PAGE_FILE = "index.tsx";

export const LAYOUT_FILE_NAME = "layout";
export const NOT_FOUND_FILE_NAME = "404";
export const ERROR_BOUNDARY_FILE_NAME = "errorBoundary";
export const LOADER_FILE_NAME = "loader";
export const HANDLE_FILE_NAME = "handle";

export const OPTIONAL_ROUTE_FLAG = "$";
export const DYNAMIC_ROUTE_FLAG = "@";

export const FILE_PATH_SEP = nodepath.sep;
export const ROUTE_PATH_SEP = "/";
