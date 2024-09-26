import { Pattern } from 'fast-glob';
import { NonIndexRouteObject } from 'react-router';
import { Plugin } from 'vite';

type ConventionalRouterProps = {
    include: Pattern | Pattern[];
    exclude: Pattern | Pattern[];
};
declare const deepCopy: <T = unknown>(data: T) => T;
/**
 * Strp slash before and after.
 */
declare const stripSlash: (filepath: string) => string;
/**
 * Route path generate by file path.
 */
declare const filePathToRoutePath: (filepath: string) => string;
/**
 * Collect files from FS by fast-glob.
 */
declare const collectRoutePages: (pages: Pattern[], ignore: Pattern[]) => NonIndexRouteObject[];
/**
 * Sub-path evaluation.
 */
declare const isSubPath: (parentPath: string, subPath: string) => boolean;
declare const isLayoutFilePath: (filepath: string) => boolean;
/**
 *
 * Two possible scenario
 * 1.
 * xx/xx/index.tsx
 * xx/xx/layout.tsx
 *
 * 2.
 * xx/xx.tsx
 * xx/xx.layout.tsx
 */
declare const isLayoutRoute: (route: NonIndexRouteObject, layoutRoute: NonIndexRouteObject) => boolean;
declare const isErrorBoundaryFilePath: (filepath: string) => boolean;
/**
 *
 * Two possible scenario
 * 1.
 * xx/xx/index.tsx
 * xx/xx/errorBoundary.tsx
 *
 * 2.
 * xx/xx.tsx
 * xx/xx.errorBoundary.tsx
 *
 */
declare const isErrorBoundaryRoute: (route: NonIndexRouteObject, errorBoundaryRoute: NonIndexRouteObject) => boolean;
/**
 * Arrange routes.
 */
declare const arrangeRoutes: (routes: NonIndexRouteObject[], parent: NonIndexRouteObject, subRoutesPathAppendToParent: string[], layoutAndErrorBoundaries?: NonIndexRouteObject[]) => NonIndexRouteObject;
/**
 * Stringify routes data.
 */
declare const stringifyRoutes: (routes: NonIndexRouteObject[]) => string;
declare function ConventionalRouter(options?: Partial<ConventionalRouterProps>): Plugin;

export { arrangeRoutes, collectRoutePages, deepCopy, ConventionalRouter as default, filePathToRoutePath, isErrorBoundaryFilePath, isErrorBoundaryRoute, isLayoutFilePath, isLayoutRoute, isSubPath, stringifyRoutes, stripSlash };
