import type { AxiosResponse } from "axios";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, apiClient } from "@/shared/api";
import { getPublicCourseRequest, getPublicCoursesRequest } from "../api/public-courses.api";
import { getPublicCourse, getPublicCourses, toCourseId } from "./public-courses.service";

/*
  The service, driven through the real API module with the shared axios instance stubbed at
  its `get` — so the URL, the query string, the envelope unwrapping and the mapper all run as
  they ship, and the request provably goes through `apiClient` rather than around it.
*/

function response(body: unknown, status = 200): AxiosResponse {
  return { status, data: body, headers: {}, config: {}, statusText: "OK" } as unknown as AxiosResponse;
}

function envelope(data: unknown, status = 200): AxiosResponse {
  return response({ status: "success", data }, status);
}

const COURSE = {
  id: 42,
  title: "دورة تجريبية",
  subtitle: null,
  imageUrl: null,
  instructorName: null,
  durationSeconds: null,
  lessonCount: 3,
  description: "وصف",
  offer: { accessType: "FREE", pricingStatus: "FREE", currency: null, purchasePrice: null, plans: [] },
};

const PAGE = { items: [COURSE], page: 0, size: 12, totalItems: 1, totalPages: 1 };

function stubGet() {
  return vi.spyOn(apiClient, "get");
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("the request", () => {
  it("lists through the shared client with page and size as query parameters", async () => {
    const get = stubGet().mockResolvedValue(envelope(PAGE));

    await getPublicCourses();
    await getPublicCourses(2, 50);

    expect(get).toHaveBeenNthCalledWith(1, "v1/public/courses", { params: { page: 0, size: 12 } });
    expect(get).toHaveBeenNthCalledWith(2, "v1/public/courses", { params: { page: 2, size: 50 } });
  });

  it("opens one course by its id", async () => {
    const get = stubGet().mockResolvedValue(envelope(COURSE));

    await getPublicCourse("42");

    expect(get).toHaveBeenCalledWith("v1/public/courses/42");
  });

  it("uses the same-origin base URL, cookies and CSRF settings every other request uses", () => {
    expect(apiClient.defaults.withCredentials).toBe(true);
    expect(apiClient.defaults.xsrfCookieName).toBe("XSRF-TOKEN");
    // The API modules pass paths relative to the configured base, never an absolute URL.
    expect(getPublicCoursesRequest).toBeTypeOf("function");
    expect(getPublicCourseRequest).toBeTypeOf("function");
  });
});

describe("getPublicCourses", () => {
  it("returns the validated page", async () => {
    stubGet().mockResolvedValue(envelope(PAGE));

    const page = await getPublicCourses();

    expect(page.items).toEqual([expect.objectContaining({ id: 42, offer: { kind: "FREE" } })]);
    expect(page.totalItems).toBe(1);
  });

  it.each([
    ["the network is down", new ApiError(0, ["Network Error"]), "network"],
    ["the visitor is rate limited", new ApiError(429, ["Too many requests"]), "rate-limited"],
    ["the server fails", new ApiError(500, ["boom"]), "server"],
    ["the route does not exist on this backend", new ApiError(404, ["not found"]), "server"],
  ])("reports %s", async (_label, error, kind) => {
    stubGet().mockRejectedValue(error);

    await expect(getPublicCourses()).rejects.toMatchObject({ name: "PublicCourseError", kind });
  });

  it("reports an empty success envelope as malformed", async () => {
    stubGet().mockResolvedValue(response({ status: "success" }));

    await expect(getPublicCourses()).rejects.toMatchObject({ kind: "malformed" });
  });

  it("reports a payload that is not a page as malformed", async () => {
    stubGet().mockResolvedValue(envelope([COURSE]));

    await expect(getPublicCourses()).rejects.toMatchObject({ kind: "malformed" });
  });

  it.each([
    [-1, 12],
    [0, 0],
    [0, 51],
    [1.5, 12],
  ])("refuses page %s size %s without asking the server", async (page, size) => {
    const get = stubGet();

    await expect(getPublicCourses(page, size)).rejects.toBeInstanceOf(RangeError);
    expect(get).not.toHaveBeenCalled();
  });
});

describe("getPublicCourse", () => {
  it("returns the validated course", async () => {
    stubGet().mockResolvedValue(envelope(COURSE));

    await expect(getPublicCourse(42)).resolves.toMatchObject({ id: 42, description: "وصف", offer: { kind: "FREE" } });
  });

  it("reports a course that is not on offer as not found", async () => {
    stubGet().mockRejectedValue(new ApiError(404, ["Course not found with id: 42"]));

    await expect(getPublicCourse("42")).rejects.toMatchObject({ kind: "not-found" });
  });

  it.each(["0", "-1", "042", "+42", "0x2a", "4.2", "abc", "", "99999999999999999999"])(
    "reads the address %j as a course that does not exist, without a request",
    async (raw) => {
      const get = stubGet();

      await expect(getPublicCourse(raw)).rejects.toMatchObject({ kind: "not-found" });
      expect(get).not.toHaveBeenCalled();
    },
  );

  it.each([
    [new ApiError(0, ["offline"]), "network"],
    [new ApiError(429, ["slow down"]), "rate-limited"],
    [new ApiError(503, ["down"]), "server"],
    [new Error("unexpected"), "malformed"],
  ])("reports %s as %s", async (error, kind) => {
    stubGet().mockRejectedValue(error);

    await expect(getPublicCourse(42)).rejects.toMatchObject({ kind });
  });

  it("reports a course without an id or title as malformed", async () => {
    stubGet().mockResolvedValue(envelope({ ...COURSE, id: null }));

    await expect(getPublicCourse(42)).rejects.toMatchObject({ kind: "malformed" });
  });
});

describe("toCourseId", () => {
  it("accepts the catalogue's own spelling of an id and nothing else", () => {
    expect(toCourseId("42")).toBe(42);
    expect(toCourseId(42)).toBe(42);
    expect(toCourseId("9007199254740991")).toBe(9007199254740991);
    for (const raw of ["0", "042", "+42", "-42", "0x2a", "4.2", "4e1", " 42", "", "9007199254740993"]) {
      expect(toCourseId(raw), raw).toBeNull();
    }
  });
});
