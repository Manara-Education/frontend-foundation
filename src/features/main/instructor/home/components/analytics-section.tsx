import { Users, BookOpen } from "lucide-react";
import { AnalyticsCard } from "./analytics-card";

interface AnalyticsSectionProps {
  totalEnrolled: number;
  coursesCount: number;
}

export function AnalyticsSection({ totalEnrolled, coursesCount }: AnalyticsSectionProps) {
  return (
    <section className="mb-10">
      <div className="grid grid-cols-2 gap-4">
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
