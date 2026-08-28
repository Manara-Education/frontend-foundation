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
 * Visibility is the second axis a course has, and every assertion here is about it staying
 * a second axis: carried beside the publication state, never inferred from it, never
 * inferring it, and never able to hide a course by being left unsaid.
 */
describe("course visibility", () => {
  it("sends visibility on every save, including an update that omits status", () => {
    const request = mapCourseEditorStateToCourseRequest(
      editorState({ status: "PUBLISHED", visibility: "PRIVATE" }),
    );

    expect(request.visibility).toBe("PRIVATE");
    expect(request).not.toHaveProperty("status");
  });

  it("a new course starts public, matching the backend's own default", () => {
    expect(createEmptyCourseEditorState().visibility).toBe("PUBLIC");
    expect(mapCourseEditorStateToCourseRequest(createEmptyCourseEditorState()).visibility)
      .toBe("PUBLIC");
  });

  it("reads visibility back into editor state, independently of the status", () => {
    const state = mapInstructorCourseResponseToEditorState(
      instructorResponse({ status: "PUBLISHED", visibility: "PRIVATE" }),
    );

    expect(state.status).toBe("PUBLISHED");
    expect(state.visibility).toBe("PRIVATE");
  });

  it("reads visibility onto the card, alongside the publication state", () => {
    const card = mapCourseResponseToCourseCardModel(
      courseResponse({ status: "PUBLISHED", visibility: "PRIVATE" }),
    );

    expect(card.status).toBe("PUBLISHED");
    expect(card.visibility).toBe("PRIVATE");
  });

  /*
    A payload from a backend that predates the field has to read as public. The other
    direction would badge every course on the platform as private and tell instructors their
    live courses had gone dark — a display lie about a security property, which is the worst
    way for this particular default to be wrong.
  */
  it("treats an absent visibility as public, on both shapes", () => {
    expect(mapCourseResponseToCourseCardModel(courseResponse({ visibility: undefined })).visibility)
      .toBe("PUBLIC");
    expect(mapCourseResponseToCourseCardModel(courseResponse({ visibility: null })).visibility)
      .toBe("PUBLIC");
    expect(
      mapInstructorCourseResponseToEditorState(instructorResponse({ visibility: undefined }))
        .visibility,
    ).toBe("PUBLIC");
  });

  it("carries a draft's visibility without turning it into a publication state", () => {
    const state = mapInstructorCourseResponseToEditorState(
      instructorResponse({ status: "DRAFT", visibility: "PRIVATE" }),
    );

    expect(state.status).toBe("DRAFT");
    expect(state.visibility).toBe("PRIVATE");

    const request = mapCourseEditorStateToCourseRequest(state, { includeStatus: true });
    expect(request.status).toBe("DRAFT");
    expect(request.visibility).toBe("PRIVATE");
  });
});

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

/**
 * The revision the payload was built from, which the server checks the save against.
 *
 * A full-replacement `PUT` built from an hour-old copy of the course is an hour-old course, so
 * it has to say which revision it came from or the server has no way to tell. The value is
 * carried through untouched in both directions — never computed here, and never invented.
 */
describe("the course revision, in both directions", () => {
  it("is read off the aggregate response onto the editor state", () => {
    expect(mapInstructorCourseResponseToEditorState(instructorResponse({ revision: 12 })).revision)
      .toBe(12);
  });

  it("reads as absent from a payload that does not carry it", () => {
    expect(mapInstructorCourseResponseToEditorState(instructorResponse()).revision).toBeNull();
  });

  it("is sent back as `expectedRevision` on an update", () => {
    expect(mapCourseEditorStateToCourseRequest(editorState({ revision: 12 })).expectedRevision)
      .toBe(12);
  });

  it("is left out entirely when there is no revision to be behind", () => {
    // A create has no revision yet, and the server only requires one on update.
    expect(mapCourseEditorStateToCourseRequest(editorState({ revision: null })))
      .not.toHaveProperty("expectedRevision");
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
