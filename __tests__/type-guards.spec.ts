import type { ActionFunction, LoaderFunction } from "react-router";
import { describe, expect, it } from "vitest";

import { isActionFunction, isComponentType, isLoaderFunction, isStringExport } from "@/type-guards";

describe("Type Guards", () => {
  describe("isStringExport", () => {
    it("should return true for string values", () => {
      expect(isStringExport("hello")).toBe(true);
      expect(isStringExport("")).toBe(true);
    });

    it("should return false for non-string values", () => {
      expect(isStringExport(123)).toBe(false);
      expect(isStringExport(null)).toBe(false);
      expect(isStringExport(undefined)).toBe(false);
      expect(isStringExport({})).toBe(false);
      expect(isStringExport([])).toBe(false);
      expect(isStringExport(() => {})).toBe(false);
    });

    it("should narrow type correctly", () => {
      const value: unknown = "test";
      if (isStringExport(value)) {
        expect(value.toUpperCase()).toBe("TEST");
      }
    });
  });

  describe("isLoaderFunction", () => {
    it("should return true for function values", () => {
      const loader: LoaderFunction = () => Promise.resolve({ data: "test" });
      expect(isLoaderFunction(loader)).toBe(true);
    });

    it("should return true for async functions", () => {
      const asyncLoader: LoaderFunction = async () => ({ data: "test" });
      expect(isLoaderFunction(asyncLoader)).toBe(true);
    });

    it("should return false for non-function values", () => {
      expect(isLoaderFunction("string")).toBe(false);
      expect(isLoaderFunction(123)).toBe(false);
      expect(isLoaderFunction(null)).toBe(false);
      expect(isLoaderFunction(undefined)).toBe(false);
      expect(isLoaderFunction({})).toBe(false);
      expect(isLoaderFunction([])).toBe(false);
    });

    it("should narrow type correctly", () => {
      const value: unknown = () => Promise.resolve({ data: "test" });
      if (isLoaderFunction(value)) {
        expect(typeof value).toBe("function");
      }
    });
  });

  describe("isActionFunction", () => {
    it("should return true for function values", () => {
      const action: ActionFunction = () => Promise.resolve({ data: "test" });
      expect(isActionFunction(action)).toBe(true);
    });

    it("should return true for async functions", () => {
      const asyncAction: ActionFunction = async () => ({ data: "test" });
      expect(isActionFunction(asyncAction)).toBe(true);
    });

    it("should return false for non-function values", () => {
      expect(isActionFunction("string")).toBe(false);
      expect(isActionFunction(123)).toBe(false);
      expect(isActionFunction(null)).toBe(false);
      expect(isActionFunction(undefined)).toBe(false);
      expect(isActionFunction({})).toBe(false);
      expect(isActionFunction([])).toBe(false);
    });

    it("should narrow type correctly", () => {
      const value: unknown = () => Promise.resolve({ data: "test" });
      if (isActionFunction(value)) {
        expect(typeof value).toBe("function");
      }
    });
  });

  describe("isComponentType", () => {
    it("should return true for function components", () => {
      const FunctionComponent = () => null;
      expect(isComponentType(FunctionComponent)).toBe(true);
    });

    it("should return true for named function components", () => {
      function NamedComponent() {
        return null;
      }
      expect(isComponentType(NamedComponent)).toBe(true);
    });

    it("should return false for non-component values", () => {
      expect(isComponentType("string")).toBe(false);
      expect(isComponentType(123)).toBe(false);
      expect(isComponentType(null)).toBe(false);
      expect(isComponentType(undefined)).toBe(false);
      expect(isComponentType({})).toBe(false);
      expect(isComponentType([])).toBe(false);
    });

    it("should narrow type correctly", () => {
      const value: unknown = () => null;
      if (isComponentType(value)) {
        expect(typeof value).toBe("function");
      }
    });
  });
});
