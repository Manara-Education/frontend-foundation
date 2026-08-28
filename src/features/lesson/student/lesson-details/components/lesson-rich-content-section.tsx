import { motion } from "motion/react";
import { RichContentView } from "@/shared/rich-content";
import type { RichDocument } from "@/shared/rich-content";
import { FONT } from "./lesson.constants";

interface LessonRichContentSectionProps {
  document: RichDocument;
}

/**
 * A rich-content lesson's body.
 *
 * The counterpart to `VideoPlayer` in the lesson's content-type branch, and everything it is not is
 * as deliberate as everything it is. There is no player, no aspect-ratio box waiting for a video,
 * no poster frame, no play control and no duration — because none of those describe a lesson that
 * is read. A lesson with an empty video frame at the top of it is the shape this feature exists to
 * remove, so this component draws nothing where one would have gone.
 *
 * The card matches `LessonContentSection`, its neighbour on the same page, so a rich-content lesson
 * reads as part of Manara rather than as a document pasted into it.
 */
export function LessonRichContentSection({ document }: LessonRichContentSectionProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 }}
      style={{
        borderRadius: 20,
        background: "#FFFFFF",
        border: "1.5px solid #ECECEC",
        // Generous horizontal padding, and a measure the eye can follow: a lesson is read, and full
        // browser width is not a readable line length.
        padding: "26px 26px 28px",
        marginBottom: 16,
        boxShadow: "0 2px 12px rgba(78,91,146,0.04)",
        // Both together are what keep a long word or a pasted URL from widening the page rather
        // than wrapping inside the card.
        overflowWrap: "anywhere",
        minWidth: 0,
      }}
    >
      {document.blocks.length > 0 ? (
        <div style={{ maxWidth: "72ch", marginInline: "auto" }}>
          <RichContentView document={document} dir="rtl" />
        </div>
      ) : (
        // Reachable only for a lesson whose document could not be read — the server refuses to
        // store an empty one. Saying so beats an empty card that looks like a failed render.
        <p style={{ fontFamily: FONT, fontSize: 14, color: "#9BA3C4", margin: 0, textAlign: "center" }}>
          لا يوجد محتوى لعرضه في هذا الدرس
        </p>
      )}
    </motion.article>
  );
}
