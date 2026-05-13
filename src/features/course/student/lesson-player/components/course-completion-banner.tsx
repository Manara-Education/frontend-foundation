import { Trophy } from "lucide-react";
import { motion } from "motion/react";
import { FONT, SUCCESS } from "./lesson-player.constants";

interface CourseCompletionBannerProps {
  courseTitle: string;
}

export function CourseCompletionBanner({ courseTitle }: CourseCompletionBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{
        marginBottom: 16,
        padding: "20px 24px",
        borderRadius: 20,
        background:
          "linear-gradient(135deg, rgba(34,197,94,0.08) 0%, rgba(34,197,94,0.04) 100%)",
        border: "1.5px solid rgba(34,197,94,0.22)",
        display: "flex",
        alignItems: "center",
        gap: 16,
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          width: 46,
          height: 46,
          borderRadius: 15,
          background: "rgba(34,197,94,0.14)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Trophy size={22} color={SUCCESS} strokeWidth={1.8} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: FONT, fontSize: 15, color: "#15803D", marginBottom: 2 }}>
          أحسنت! لقد أتممت هذا الدرس
        </div>
        <div style={{ fontFamily: FONT, fontSize: 12, color: "#9BA3C4" }}>
          استمر في التعلم لإكمال دورة {courseTitle}
        </div>
      </div>
    </motion.div>
  );
}
