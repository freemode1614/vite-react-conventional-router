import type { ComponentType } from "react";
import type { ActionFunction, LoaderFunction } from "react-router";

export function isStringExport(value: unknown): value is string {
  return typeof value === "string";
}

export function isLoaderFunction(value: unknown): value is LoaderFunction {
  return typeof value === "function";
}

export function isActionFunction(value: unknown): value is ActionFunction {
  return typeof value === "function";
}

export function isComponentType(value: unknown): value is ComponentType {
  return typeof value === "function";
}
