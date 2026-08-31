import { Users, BookOpen } from "lucide-react";
import { AnalyticsCard } from "./analytics-card";
import type { CSSProperties } from "react";

interface AnalyticsSectionProps {
  totalEnrolled: number;
  coursesCount: number;
}

const analyticsGridStyle = {
  "--rs-grid-min": "260px",
  "--rs-grid-gap": "16px",
} as CSSProperties;

export function AnalyticsSection({ totalEnrolled, coursesCount }: AnalyticsSectionProps) {
  return (
    <section className="mb-10">
      <div className="rs-grid" style={analyticsGridStyle}>
        <AnalyticsCard
          value={totalEnrolled}
          label="عدد الطلاب المشتركين"
          icon={Users}
          delay={0.1}
        />
        <AnalyticsCard
          value={coursesCount}
          label="الدورات المنشورة"
          icon={BookOpen}
          delay={0.16}
        />
      </div>
    </section>
  );
}
