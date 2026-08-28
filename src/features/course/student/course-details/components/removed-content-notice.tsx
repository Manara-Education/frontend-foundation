import { motion } from "motion/react";
import { Archive } from "lucide-react";

import type { RemovedContentResponse } from "@/shared/courses";
import { FONT } from "../formatters/course-details.formatter";

/**
 * What the instructor took out of this course since the learner joined it.
 *
 * <h4>Why it is not a curriculum row</h4>
 * Every other change this feature reports lands on the thing it happened to — a lesson
 * says it was updated, a module says it is new. A removal has nothing left to land on:
 * the row is gone, and that is exactly the problem. Without this the learner's course
 * quietly loses a lesson between two visits, with the progress bar moving for no visible
 * reason and no way to tell a deletion from their own misremembering.
 *
 * <h4>Names, not links</h4>
 * The titles come from the server's change log, snapshotted when the content was deleted,
 * because there is nothing left to read them from. Nothing here is clickable — there is
 * nothing to open — so the block is deliberately quiet: muted, low-contrast, and absent
 * entirely when nothing has been removed.
 */
export function RemovedContentNotice({ items }: { items: RemovedContentResponse[] }) {
  if (items.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      role="status"
      style={{
        display: "flex",
        // Wraps to a stacked layout on a narrow screen instead of squeezing the list.
        flexWrap: "wrap",
        alignItems: "flex-start",
        gap: 10,
        padding: "12px 14px",
        marginBottom: 12,
        borderRadius: 14,
        background: "rgba(120,120,140,0.05)",
        border: "1px solid rgba(120,120,140,0.16)",
      }}
    >
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: 8,
          background: "rgba(120,120,140,0.10)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          color: "#6B7280",
        }}
      >
        <Archive size={13} strokeWidth={1.9} aria-hidden="true" />
      </div>

      <div style={{ flex: 1, minWidth: 160 }}>
        <div style={{ fontFamily: FONT, fontSize: 12, color: "#4B5563", lineHeight: 1.6 }}>
          محتوى لم يعد جزءاً من الدورة
        </div>
        <ul style={{ margin: "4px 0 0", paddingInlineStart: 16, listStyle: "disc" }}>
          {items.map((item, index) => (
            <li
              // The entity is gone, so there is no id to key on that survives it. Position
              // is stable here because the list is rendered once from an immutable prop and
              // never reordered or filtered.
              key={`${item.entityType}-${index}`}
              style={{
                fontFamily: FONT,
                fontSize: 11,
                color: "#6B7280",
                lineHeight: 1.7,
                overflowWrap: "anywhere",
              }}
            >
              {item.title}
              {item.summary ? ` — ${item.summary}` : ""}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
