import { motion } from "motion/react";
import { Search } from "lucide-react";
import { FILTERS, FONT, PRIMARY, formatResultsCount } from "../formatters/courses.formatter";
import type { FilterKey } from "../types/courses.types";

interface CoursesSearchFiltersProps {
  query: string;
  activeFilter: FilterKey;
  filteredCount: number;
  onQueryChange: (value: string) => void;
  onFilterChange: (key: FilterKey) => void;
}

export function CoursesSearchFilters({
  query,
  activeFilter,
  filteredCount,
  onQueryChange,
  onFilterChange,
}: CoursesSearchFiltersProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 32 }}>
      {/* Search */}
      <div style={{ position: "relative" }}>
        <div
          style={{
            position: "absolute",
            right: 16,
            top: "50%",
            transform: "translateY(-50%)",
            color: "#B0B7D4",
            pointerEvents: "none",
            display: "flex",
          }}
        >
          <Search size={16} strokeWidth={1.8} />
        </div>
        <input
          type="text"
          dir="rtl"
          placeholder="ابحث عن دورة..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          style={{
            width: "100%",
            height: 48,
            borderRadius: 16,
            border: "1.5px solid #ECECEC",
            background: "#FFFFFF",
            paddingRight: 44,
            paddingLeft: 18,
            fontFamily: FONT,
            fontSize: 14,
            color: "#1F2937",
            outline: "none",
            transition: "border-color 0.18s, box-shadow 0.18s",
            boxSizing: "border-box",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "rgba(78,91,146,0.4)";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(78,91,146,0.08)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "#ECECEC";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
      </div>

      {/* Filter chips */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {FILTERS.map(({ key, label }) => {
          const isActive = activeFilter === key;
          return (
            <motion.button
              key={key}
              onClick={() => onFilterChange(key)}
              whileTap={{ scale: 0.96 }}
              style={{
                padding: "7px 18px",
                borderRadius: 99,
                border: `1.5px solid ${isActive ? PRIMARY : "#ECECEC"}`,
                background: isActive ? PRIMARY : "#FFFFFF",
                color: isActive ? "#FFFFFF" : "#6B7280",
                fontFamily: FONT,
                fontWeight: isActive ? 600 : 500,
                fontSize: 13,
                cursor: "pointer",
                transition: "all 0.18s ease",
                boxShadow: isActive ? "0 4px 14px rgba(78,91,146,0.22)" : "none",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = "rgba(78,91,146,0.3)";
                  e.currentTarget.style.color = PRIMARY;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = "#ECECEC";
                  e.currentTarget.style.color = "#6B7280";
                }
              }}
            >
              {label}
            </motion.button>
          );
        })}

        {/* Results count */}
        {(query.trim() || activeFilter !== "all") && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "7px 14px",
              borderRadius: 99,
              background: "rgba(78,91,146,0.06)",
              fontFamily: FONT,
              fontSize: 12,
              color: "#9BA3C4",
              marginRight: "auto",
            }}
          >
            {formatResultsCount(filteredCount)}
          </motion.div>
        )}
      </div>
    </div>
  );
}
