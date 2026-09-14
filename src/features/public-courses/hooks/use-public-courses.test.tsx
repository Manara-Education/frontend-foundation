import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/shared/api";
import { getPublicCourseRequest, getPublicCoursesRequest } from "../api/public-courses.api";
import { usePublicCourse, usePublicCourses } from "./use-public-courses";

/*
  Stubbed at the HTTP boundary, so the service and the mapper run for real: the states a
  screen receives are the ones the shipped code produces from a given server answer.
*/
vi.mock("../api/public-courses.api", () => ({
  getPublicCoursesRequest: vi.fn(),
  getPublicCourseRequest: vi.fn(),
}));

const listRequest = vi.mocked(getPublicCoursesRequest);
const detailRequest = vi.mocked(getPublicCourseRequest);

type Response = Awaited<ReturnType<typeof getPublicCoursesRequest>>;

function envelope(data: unknown): Response {
  return { status: 200, data: { status: "success", data } } as Response;
}

function course(id: number, title: string) {
  return {
    id,
    title,
    subtitle: null,
    imageUrl: null,
    instructorName: null,
    durationSeconds: null,
    lessonCount: 1,
    description: null,
    offer: { accessType: "PURCHASE", pricingStatus: "PRICED", currency: "EGP", purchasePrice: 300, plans: [] },
  };
}

function page(...items: unknown[]) {
  return { items, page: 0, size: 12, totalItems: items.length, totalPages: items.length ? 1 : 0 };
}

afterEach(() => {
  vi.resetAllMocks();
});

describe("usePublicCourses", () => {
  it("starts loading and becomes ready with the page", async () => {
    listRequest.mockResolvedValue(envelope(page(course(1, "أولى"))));

    const { result } = renderHook(() => usePublicCourses());

    expect(result.current.state).toEqual({ status: "loading" });
    await waitFor(() => expect(result.current.state.status).toBe("ready"));
    expect(result.current.state).toMatchObject({ page: { items: [{ id: 1, title: "أولى" }] } });
  });

  it("says the catalogue is empty rather than inventing courses", async () => {
    listRequest.mockResolvedValue(envelope(page()));

    const { result } = renderHook(() => usePublicCourses());

    await waitFor(() => expect(result.current.state.status).toBe("empty"));
  });

  it("reports a failure and recovers on retry", async () => {
    listRequest.mockRejectedValueOnce(new ApiError(0, ["Network Error"]));
    listRequest.mockResolvedValueOnce(envelope(page(course(2, "بعد المحاولة"))));

    const { result } = renderHook(() => usePublicCourses());

    await waitFor(() => expect(result.current.state).toEqual({ status: "error", failure: "network" }));
    act(() => result.current.retry());
    expect(result.current.state).toEqual({ status: "loading" });
    await waitFor(() => expect(result.current.state.status).toBe("ready"));
  });

  it("reports a malformed answer as a failure, not as an empty catalogue", async () => {
    listRequest.mockResolvedValue(envelope({ nope: true }));

    const { result } = renderHook(() => usePublicCourses());

    await waitFor(() => expect(result.current.state).toEqual({ status: "error", failure: "malformed" }));
  });

  it("shows the answer to the newest request when an older one arrives late", async () => {
    let releaseFirst!: (value: Response) => void;
    listRequest.mockReturnValueOnce(new Promise<Response>((resolve) => (releaseFirst = resolve)));
    listRequest.mockResolvedValueOnce(envelope(page(course(3, "الأحدث"))));

    const { result } = renderHook(() => usePublicCourses());
    act(() => result.current.retry());
    await waitFor(() => expect(result.current.state.status).toBe("ready"));

    await act(async () => releaseFirst(envelope(page(course(4, "القديم")))));

    expect(result.current.state).toMatchObject({ page: { items: [{ id: 3 }] } });
  });

  it("drops an answer that arrives after the page has gone", async () => {
    let release!: (value: Response) => void;
    listRequest.mockReturnValueOnce(new Promise<Response>((resolve) => (release = resolve)));
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});

    const { result, unmount } = renderHook(() => usePublicCourses());
    unmount();
    await act(async () => release(envelope(page(course(5, "متأخر")))));

    expect(result.current.state).toEqual({ status: "loading" });
    expect(errors).not.toHaveBeenCalled();
  });
});

describe("usePublicCourse", () => {
  it("becomes ready with the course", async () => {
    detailRequest.mockResolvedValue(envelope(course(7, "تفاصيل")));

    const { result } = renderHook(() => usePublicCourse("7"));

    await waitFor(() => expect(result.current.state.status).toBe("ready"));
    expect(detailRequest).toHaveBeenCalledWith(7);
  });

  it("reports a course that is not on offer as not found, without a retry state", async () => {
    detailRequest.mockRejectedValue(new ApiError(404, ["Course not found with id: 7"]));

    const { result } = renderHook(() => usePublicCourse("7"));

    await waitFor(() => expect(result.current.state).toEqual({ status: "not-found" }));
  });

  it("reports a malformed or missing id as not found without asking the server", async () => {
    const { result: mangled } = renderHook(() => usePublicCourse("0x7"));
    const { result: missing } = renderHook(() => usePublicCourse(undefined));

    await waitFor(() => expect(mangled.current.state).toEqual({ status: "not-found" }));
    await waitFor(() => expect(missing.current.state).toEqual({ status: "not-found" }));
    expect(detailRequest).not.toHaveBeenCalled();
  });

  it("reports rate limiting as a retryable failure", async () => {
    detailRequest.mockRejectedValue(new ApiError(429, ["Too many requests"]));

    const { result } = renderHook(() => usePublicCourse("7"));

    await waitFor(() => expect(result.current.state).toEqual({ status: "error", failure: "rate-limited" }));
  });

  it("loads the new course when the address changes", async () => {
    detailRequest.mockImplementation(async (id: number) => envelope(course(id, `دورة ${id}`)));

    const { result, rerender } = renderHook(({ id }) => usePublicCourse(id), { initialProps: { id: "7" } });
    await waitFor(() => expect(result.current.state).toMatchObject({ course: { id: 7 } }));

    rerender({ id: "8" });

    await waitFor(() => expect(result.current.state).toMatchObject({ course: { id: 8 } }));
  });
});
