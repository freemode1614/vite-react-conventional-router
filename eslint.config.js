import prettier from "@moccona/eslint-config/extra/prettier";
import ts from "@moccona/eslint-config/extra/typescript";
import baseConfig from "@moccona/eslint-config/flat";

export default [...baseConfig, ...ts, ...prettier];
