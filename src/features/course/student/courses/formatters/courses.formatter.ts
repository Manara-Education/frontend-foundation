import type { FilterOption, Status, StatusConfig } from "../types/courses.types";

export const PRIMARY = "#4E5B92";
export const FONT = "'Cairo', sans-serif";
export const SUCCESS = "#22C55E";
export const WARNING = "#F59E0B";
export const GRAY = "#6B7280";

export const STATUS_CONFIG: Record<Status, StatusConfig> = {
  "in-progress": { label: "قيد التقدم", bg: "rgba(245,158,11,0.10)", text: "#B45309", dot: WARNING },
  "completed":   { label: "مكتملة",     bg: "rgba(34,197,94,0.10)",  text: "#15803D", dot: SUCCESS },
  "not-started": { label: "لم تبدأ",    bg: "rgba(107,114,128,0.09)", text: "#6B7280", dot: GRAY },
};

export const FILTERS: FilterOption[] = [
  { key: "all",         label: "الكل"       },
  { key: "in-progress", label: "قيد التقدم" },
  { key: "completed",   label: "مكتملة"     },
  { key: "not-started", label: "لم تبدأ"    },
];

export const SHIMMER_CSS = `
  @keyframes cv-shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position:  600px 0; }
  }
  .cv-sk {
    background: linear-gradient(100deg,#EAECF5 0%,#EAECF5 35%,#F4F5FB 50%,#EAECF5 65%,#EAECF5 100%);
    background-size: 600px 100%;
    animation: cv-shimmer 1.9s ease-in-out infinite;
  }
`;

export function formatLessonsProgress(completed: number, total: number): string {
  return `${completed} من ${total} درس`;
}

export function formatPercent(progress: number): string {
  return `${progress}٪`;
}

export function formatResultsCount(count: number): string {
  return `${count} دورة`;
}

export function getGreeting(date: Date = new Date()): string {
  const h = date.getHours();
  if (h >= 5 && h < 12) return "صباح الخير";
  if (h >= 12 && h < 17) return "مساء الخير";
  if (h >= 17 && h < 21) return "مساء النور";
  return "أهلاً بك";
}
