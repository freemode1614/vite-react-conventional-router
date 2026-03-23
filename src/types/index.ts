import type { Pattern } from "fast-glob";
import type { NonIndexRouteObject } from "react-router";

export type ConventionalRouterProps = {
  include: Pattern | Pattern[];
  exclude: Pattern | Pattern[];
  lazy: boolean;
};

export type SideEffects = {
  layout?: NonIndexRouteObject;
  errorBoundary?: NonIndexRouteObject;
  loader?: NonIndexRouteObject;
  handle?: NonIndexRouteObject;
  routes?: NonIndexRouteObject[];
};

export type CollectReturn = {
  "404"?: NonIndexRouteObject;
  layout?: NonIndexRouteObject;
  loader?: NonIndexRouteObject;
  handle?: NonIndexRouteObject;
  routes?: NonIndexRouteObject[];
};

export type ImportTracker = {
  loader: Map<string, string>;
  handle: Map<string, string>;
  action: Map<string, string>;
  errorBoundary: Map<string, string>;
};

export interface RouteConflict {
  path: string;
  files: string[];
}

export type Severity = "error" | "warn" | "info";

export interface ValidationIssue {
  severity: Severity;
  message: string;
  files?: string[];
  suggestion?: string;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
  conflicts: RouteConflict[];
}
