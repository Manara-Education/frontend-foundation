import { motion } from "motion/react";
import { Search, X } from "lucide-react";

const FONT = "'Cairo', sans-serif";
const TEXT_DARK = "#1A1F3C";
const TEXT_MUTE = "#A8ADCA";

interface SearchBarProps {
  query: string;
  onQueryChange: (q: string) => void;
}

export function SearchBar({ query, onQueryChange }: SearchBarProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.14 }}
      className="mb-7"
    >
      <div className="relative mb-4">
        <div
          className="absolute inset-y-0 flex items-center pointer-events-none"
          style={{ right: 16 }}
        >
          <Search size={16} style={{ color: TEXT_MUTE }} strokeWidth={1.8} />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="ابحث عن دورة..."
          dir="rtl"
          style={{
            width: "100%",
            height: 50,
            paddingRight: 44,
            paddingLeft: query ? 44 : 18,
            fontFamily: FONT,
            fontSize: 14,
            color: TEXT_DARK,
            background: "#fff",
            border: `1.5px solid rgba(78,91,146,0.13)`,
            borderRadius: 16,
            outline: "none",
            boxShadow: "0 2px 12px rgba(78,91,146,0.05)",
            transition: "border-color 0.18s, box-shadow 0.18s",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "rgba(78,91,146,0.35)";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(78,91,146,0.08)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "rgba(78,91,146,0.13)";
            e.currentTarget.style.boxShadow = "0 2px 12px rgba(78,91,146,0.05)";
          }}
        />

        {query && (
          <button
            onClick={() => onQueryChange("")}
            className="absolute inset-y-0 flex items-center"
            style={{
              left: 14,
              background: "none",
              border: "none",
              cursor: "pointer",
              color: TEXT_MUTE,
            }}
          >
            <X size={15} strokeWidth={2} />
          </button>
        )}
      </div>
    </motion.section>
  );
}
