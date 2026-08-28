import { describe, expect, it } from "vitest";
import {
  mapCourseEditorStateToCourseRequest,
  mapInstructorCourseResponseToEditorState,
  type InstructorCourseResponse,
  type InstructorLessonResponse,
} from "./index";

/**
 * A course holding a video the product cannot play, loaded into the editor and saved again.
 *
 * Published courses carry lessons written by earlier versions, by migrations and by the NAFS
 * import, some of them pointing at platforms no adapter recognises. The server reports such a
 * lesson with its URL intact and `videoProvider: null` — documented on `InstructorLessonResponse`
 * as "no player available", not as an error — and the backend now accepts that same lesson back
 * unchanged rather than refusing the whole save.
 *
 * That guarantee only holds if the editor hands the URL back exactly as it received it. Every save
 * is a full-aggregate `PUT`, so an unchanged lesson is one the payload is carrying, and a mapper
 * that dropped, blanked or "corrected" a URL it could not parse would turn a rename into an edit of
 * lesson three — which the server would then, correctly, refuse.
 */
describe("a legacy video survives a round trip through the editor", () => {
  const LEGACY_URL = "https://media.nafs.edu.sa/vod/legacy-4821.mp4";

  function lesson(overrides: Partial<InstructorLessonResponse> = {}): InstructorLessonResponse {
    return {
      id: 1,
      title: "درس",
      summary: null,
      description: null,
      // A legacy lesson is a video lesson. Both fields became required on the response when a
      // lesson gained the option of being an article, and a fixture that omits them describes a
      // shape the server can no longer send.
      contentType: "VIDEO",
      richContent: null,
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      videoProvider: "YOUTUBE",
      externalVideoId: "dQw4w9WgXcQ",
      videoEmbedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      videoThumbnailUrl: null,
      duration: null,
      orderIndex: 0,
      courseId: 7,
      moduleId: null,
      quiz: null,
      createdAt: null,
      ...overrides,
    };
  }

  /** A published course whose third lesson predates the platforms Manara supports. */
  function courseWithALegacyLesson(): InstructorCourseResponse {
    return {
      id: 7,
      title: "دورة منشورة",
      subtitle: null,
      image: null,
      description: "وصف",
      duration: 0,
      lessonCount: 3,
      studentsCount: 50,
      instructorId: 1,
      instructorName: null,
      structure: "FLAT",
      status: "PUBLISHED",
      lessons: [
        lesson({ id: 1, title: "الأول" }),
        lesson({ id: 2, title: "الثاني" }),
        lesson({
          id: 3,
          title: "الثالث",
          videoUrl: LEGACY_URL,
          videoProvider: null,
          externalVideoId: null,
          videoEmbedUrl: null,
        }),
      ],
      modules: [],
      finalQuiz: null,
      accessType: "PURCHASE",
      purchasePrice: 20,
      price: null,
      subscriptionPlans: [],
      createdAt: "2026-01-01T00:00:00",
      updatedAt: null,
      revision: 4,
    };
  }

  it("keeps the unparseable URL byte for byte, so the save reads as unchanged", () => {
    const state = mapInstructorCourseResponseToEditorState(courseWithALegacyLesson());

    const request = mapCourseEditorStateToCourseRequest(state);

    expect(request.lessons?.[2].videoUrl).toBe(LEGACY_URL);
  });

  it("never declares a provider for it, so the server is not told something new about the video", () => {
    const state = mapInstructorCourseResponseToEditorState(courseWithALegacyLesson());

    const request = mapCourseEditorStateToCourseRequest(state);

    // The URL is authoritative and the provider is derived from it. A client that volunteered
    // "YOUTUBE" here would be making a claim the server checks and rejects — turning a carried
    // lesson back into a changed one.
    expect(request.lessons?.[2]).not.toHaveProperty("videoProvider");
  });

  it("carries the other two lessons unchanged alongside it", () => {
    const state = mapInstructorCourseResponseToEditorState(courseWithALegacyLesson());

    const request = mapCourseEditorStateToCourseRequest(state);

    expect(request.lessons?.map((l) => l.id)).toEqual([1, 2, 3]);
    expect(request.lessons?.[0].videoUrl).toBe("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  });

  it("still sends the whole lesson list when only the price changed", () => {
    const state = mapInstructorCourseResponseToEditorState(courseWithALegacyLesson());

    const request = mapCourseEditorStateToCourseRequest({ ...state, purchasePrice: 40 });

    // The aggregate contract: an omitted `lessons` means "leave the content alone", and an empty
    // one means "delete everything". A reprice sends the real list, which is why the server has to
    // be able to tell a carried lesson from an edited one — and why the legacy URL above must
    // arrive intact.
    expect(request.purchasePrice).toBe(40);
    expect(request.lessons).toHaveLength(3);
    expect(request.lessons?.[2].videoUrl).toBe(LEGACY_URL);
  });

  it("quotes the revision it was built from, so the save is checked rather than blindly applied", () => {
    const state = mapInstructorCourseResponseToEditorState(courseWithALegacyLesson());

    const request = mapCourseEditorStateToCourseRequest(state);

    expect(request.expectedRevision).toBe(4);
  });
});
