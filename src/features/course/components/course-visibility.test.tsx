import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { InstructorCourseCard } from "@/features/course/components/instructor-course-card";
import {
  VisibilityRadioRow,
  VisibilitySection,
} from "@/features/course/Instructor/course-editor/components/visibility-section";
import type { CourseCardModel } from "@/shared/courses";

const PUBLISHED = /منشورة/;
const DRAFT = /مسودة/;
const PRIVATE = /^خاصة$/;
const PUBLIC = /^عامة$/;

function card(overrides: Partial<CourseCardModel> = {}): CourseCardModel {
  return {
    id: 1,
    title: "أساسيات اللغة العربية",
    price: 0,
    purchasePrice: null,
    accessType: "FREE",
    structure: "FLAT",
    status: "PUBLISHED",
    visibility: "PUBLIC",
    hasUpdatesSincePublish: false,
    ...overrides,
  };
}

/**
 * The card has to say both things at once.
 *
 * Publication and visibility are separate facts, and the temptation the whole feature has to
 * resist is collapsing them into one status chip — which would make a published private
 * course indistinguishable from a draft on the one screen where an instructor is deciding
 * what to do about it.
 */
describe("instructor course card — the two axes", () => {
  it("shows publication and privacy together for a published private course", () => {
    render(<InstructorCourseCard course={card({ status: "PUBLISHED", visibility: "PRIVATE" })} />);

    expect(screen.getByText(PUBLISHED)).toBeInTheDocument();
    expect(screen.getByText(PRIVATE)).toBeInTheDocument();
  });

  it("shows both for a private draft too — a draft is still a draft", () => {
    render(<InstructorCourseCard course={card({ status: "DRAFT", visibility: "PRIVATE" })} />);

    expect(screen.getByText(DRAFT)).toBeInTheDocument();
    expect(screen.getByText(PRIVATE)).toBeInTheDocument();
  });

  /*
    Public is what every course on the platform already is, so badging it would put a chip
    saying nothing on every row. The absence of the marker is the statement.
  */
  it("draws no visibility badge for a public course", () => {
    render(<InstructorCourseCard course={card({ status: "PUBLISHED", visibility: "PUBLIC" })} />);

    expect(screen.getByText(PUBLISHED)).toBeInTheDocument();
    expect(screen.queryByText(PRIVATE)).not.toBeInTheDocument();
  });
});

describe("the visibility control", () => {
  it("reports the instructor's choice without touching anything else", async () => {
    const onChange = vi.fn();
    render(<VisibilityRadioRow value="PUBLIC" onChange={onChange} />);

    await userEvent.click(screen.getByRole("radio", { name: PRIVATE }));

    expect(onChange).toHaveBeenCalledExactlyOnceWith("PRIVATE");
  });

  it("marks the current value as checked, in both renderings", () => {
    const { unmount } = render(<VisibilityRadioRow value="PRIVATE" onChange={vi.fn()} />);
    expect(screen.getByRole("radio", { name: PRIVATE })).toBeChecked();
    expect(screen.getByRole("radio", { name: PUBLIC })).not.toBeChecked();
    unmount();

    render(<VisibilitySection value="PUBLIC" onChange={vi.fn()} />);
    expect(screen.getByRole("radio", { name: PUBLIC })).toBeChecked();
    expect(screen.getByRole("radio", { name: PRIVATE })).not.toBeChecked();
  });

  /*
    The copy is load-bearing. The one thing an instructor could reasonably fear about this
    control is that it takes the course away from the students already in it, and the answer
    — it does not — has to be on screen at the moment they choose, not only in a doc.
  */
  it("says that enrolled students keep their access", () => {
    render(<VisibilitySection value="PRIVATE" onChange={vi.fn()} />);

    expect(screen.getByText(/الطلاب المشتركون فيها بالفعل/)).toBeInTheDocument();
  });
});
