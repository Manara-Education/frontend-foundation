import { describe, expect, it } from "vitest";
import {
  createEmptyCourseEditorState,
  mapCourseEditorStateToCourseRequest,
  mapCourseResponseToCourseCardModel,
  mapInstructorCourseResponseToEditorState,
  type CourseEditorState,
  type CourseResponse,
  type InstructorCourseResponse,
} from "./index";

function editorState(overrides: Partial<CourseEditorState> = {}): CourseEditorState {
  return {
    ...createEmptyCourseEditorState(),
    id: 7,
    title: "دورة",
    description: "وصف الدورة",
    duration: 0,
    status: "PUBLISHED",
    ...overrides,
  };
}

function courseResponse(overrides: Partial<CourseResponse> = {}): CourseResponse {
  return {
    id: 7,
    title: "دورة",
    subtitle: null,
    image: null,
    description: null,
    duration: null,
    lessonCount: null,
    price: null,
    purchasePrice: null,
    accessType: "FREE",
    structure: "FLAT",
    status: "PUBLISHED",
    studentsCount: null,
    instructorId: 1,
    instructorName: null,
    createdAt: "2026-01-01T00:00:00",
    lessons: null,
    ...overrides,
  };
}

function instructorResponse(overrides: Partial<InstructorCourseResponse> = {}): InstructorCourseResponse {
  return {
    id: 7,
    title: "دورة",
    subtitle: null,
    image: null,
    description: null,
    duration: 0,
    lessonCount: null,
    studentsCount: null,
    instructorId: 1,
    instructorName: null,
    structure: "FLAT",
    status: "PUBLISHED",
    lessons: [],
    modules: [],
    finalQuiz: null,
    accessType: "FREE",
    purchasePrice: null,
    price: null,
    subscriptionPlans: [],
    createdAt: "2026-01-01T00:00:00",
    updatedAt: null,
    ...overrides,
  };
}

/**
 * The request the editor sends is where two production faults lived, and both were faults
 * of what the payload *contained* rather than of anything it failed to send.
 */
describe("editor state → course request", () => {
  it("leaves `status` out of an update, so a save cannot change publication", () => {
    const request = mapCourseEditorStateToCourseRequest(editorState({ status: "PUBLISHED" }));

    expect(request).not.toHaveProperty("status");
  });

  it("still sends `status` on create, which is where the wizard's two buttons differ", () => {
    const request = mapCourseEditorStateToCourseRequest(editorState({ status: "DRAFT" }), {
      includeStatus: true,
    });

    expect(request.status).toBe("DRAFT");
  });

  it("never echoes `duration` back — it is the server's figure, and 0 used to be rejected", () => {
    const request = mapCourseEditorStateToCourseRequest(editorState({ duration: 0 }));

    expect(request).not.toHaveProperty("duration");
  });

  it("sends modules in the order the editor holds them", () => {
    const state = editorState({
      structure: "MODULES",
      modules: [
        { key: "c", id: 3, title: "C", description: "", lessons: [], quiz: null },
        { key: "a", id: 1, title: "A", description: "", lessons: [], quiz: null },
        { key: "b", id: 2, title: "B", description: "", lessons: [], quiz: null },
      ],
    });

    const request = mapCourseEditorStateToCourseRequest(state);

    expect(request.modules?.map((m) => m.id)).toEqual([3, 1, 2]);
    expect(request.modules?.map((m) => m.orderIndex)).toEqual([0, 1, 2]);
  });
});

describe("the update signal is carried, never computed", () => {
  it("reads the backend's answer onto the course card", () => {
    expect(
      mapCourseResponseToCourseCardModel(courseResponse({ hasUpdatesSincePublish: true }))
        .hasUpdatesSincePublish,
    ).toBe(true);
  });

  it("treats a payload that does not carry the field as 'no updates'", () => {
    expect(mapCourseResponseToCourseCardModel(courseResponse()).hasUpdatesSincePublish).toBe(false);
    expect(
      mapCourseResponseToCourseCardModel(courseResponse({ hasUpdatesSincePublish: null }))
        .hasUpdatesSincePublish,
    ).toBe(false);
  });

  it("reads it onto the editor state too", () => {
    expect(
      mapInstructorCourseResponseToEditorState(instructorResponse({ hasUpdatesSincePublish: true }))
        .hasUpdatesSincePublish,
    ).toBe(true);
    expect(
      mapInstructorCourseResponseToEditorState(instructorResponse()).hasUpdatesSincePublish,
    ).toBe(false);
  });
});
