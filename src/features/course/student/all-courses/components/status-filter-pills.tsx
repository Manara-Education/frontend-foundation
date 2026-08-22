import { motion } from "motion/react";
import type { CourseStatusCounts, CourseStatusFilter } from "../types/all-courses.types";

const PRIMARY = "#4E5B92";
const FONT = "'Cairo', sans-serif";
const TEXT_MID = "#6B708A";

interface FilterPillProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function FilterPill({ label, active, onClick }: FilterPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{
        fontFamily: FONT,
        fontSize: 13,
        fontWeight: active ? 700 : 500,
        color: active ? "#fff" : TEXT_MID,
        background: active ? `linear-gradient(135deg, ${PRIMARY} 0%, #6172AC 100%)` : "#fff",
        border: active ? "1.5px solid transparent" : `1.5px solid rgba(78,91,146,0.14)`,
        borderRadius: 14,
        padding: "9px 18px",
        cursor: "pointer",
        transition: "all 0.18s ease",
        boxShadow: active
          ? "0 4px 14px rgba(78,91,146,0.22)"
          : "0 1px 4px rgba(78,91,146,0.06)",
        outline: "none",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
}

interface StatusFilterPillsProps {
  statusFilter: CourseStatusFilter;
  counts: CourseStatusCounts;
  onStatusFilterChange: (status: CourseStatusFilter) => void;
}

export function StatusFilterPills({
  statusFilter,
  counts,
  onStatusFilterChange,
}: StatusFilterPillsProps) {
  const segments: { value: CourseStatusFilter; label: string }[] = [
    { value: "all", label: `الكل (${counts.all})` },
    { value: "published", label: `منشورة (${counts.published})` },
    { value: "draft", label: `مسودة (${counts.draft})` },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.17 }}
      className="flex items-center gap-2 flex-wrap mb-7"
    >
      {segments.map(({ value, label }) => (
        <FilterPill
          key={value}
          label={label}
          active={statusFilter === value}
          onClick={() => onStatusFilterChange(value)}
        />
      ))}
    </motion.div>
  );
}
