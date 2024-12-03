import { describe, expect, test } from "vitest";

import {
  arrangeRoutes,
  filePathToRoutePath,
  isSubPath,
  stripSlash,
} from "@/utils";

describe("main logic code test case", () => {
  test("stripSlash test case", () => {
    expect(stripSlash("/a")).toEqual("a");
    expect(stripSlash("")).toEqual("");
    expect(stripSlash("/a/b/c/")).toEqual("a/b/c");
  });

  test("isSubPath test case", () => {
    expect(isSubPath("", "a")).toStrictEqual(false);
    expect(isSubPath("a", "a/b")).toStrictEqual(true);
    expect(isSubPath("a", "a/b/c")).toStrictEqual(false);
    expect(isSubPath("a/b", "a/b")).toStrictEqual(false);
  });

  test("filePathToRoutePath test case", () => {
    expect(filePathToRoutePath("home")).toEqual("home");
    expect(filePathToRoutePath("/home/$id")).toEqual("home/:id?");
    expect(filePathToRoutePath("/home/@id")).toEqual("home/:id");
    expect(filePathToRoutePath("/home/@id/user/$userID")).toEqual(
      "home/:id/user/:userID?",
    );
  });

  // test("collectRoutePages test case", () => {
  //   expect(() => collectRoutePages(["./src/**"])).not.toThrow();
  // });
  //
  test("arrangeRoutes test case", () => {
    expect(() => arrangeRoutes([], {}, [])).not.toThrow();
  });
});
