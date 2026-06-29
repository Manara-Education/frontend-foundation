import type { CSSProperties } from "react";
import { LP_SHIMMER } from "./lesson.constants";

function SkEl({
  w,
  h,
  r = 10,
  style = {},
}: {
  w?: number | string;
  h: number | string;
  r?: number;
  style?: CSSProperties;
}) {
  return (
    <div
      className="lp-sk"
      style={{ width: w ?? "100%", height: h, borderRadius: r, flexShrink: 0, ...style }}
    />
  );
}

export function LessonSkeleton() {
  return (
    <>
      <style>{LP_SHIMMER}</style>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
        {[60, 8, 50, 8, 80, 8, 120].map((w, i) => (
          <SkEl key={i} h={13} w={w} r={5} />
        ))}
      </div>
      {/* Header skeleton */}
      <div
        style={{
          borderRadius: 20,
          background: "#fff",
          border: "1.5px solid #ECECEC",
          padding: "20px 24px",
          marginBottom: 16,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <SkEl h={13} w={80} r={6} />
          <SkEl h={22} w={100} r={99} />
        </div>
        <SkEl h={28} w="65%" r={8} style={{ marginBottom: 14 }} />
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
          <SkEl h={12} w={160} r={5} />
          <SkEl h={12} w={40} r={5} />
        </div>
        <SkEl h={5} r={99} />
      </div>
      {/* Player skeleton */}
      <div
        style={{
          borderRadius: 22,
          overflow: "hidden",
          background: "#1A1F35",
          marginBottom: 16,
          paddingTop: "56.25%",
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", inset: 0 }} className="lp-sk" />
      </div>
      {/* Content skeleton */}
      <div
        style={{
          borderRadius: 20,
          background: "#fff",
          border: "1.5px solid #ECECEC",
          padding: "22px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <SkEl h={18} w={140} r={7} />
        <SkEl h={13} w="95%" r={5} />
        <SkEl h={13} w="80%" r={5} />
        <SkEl h={13} w="90%" r={5} />
        <SkEl h={13} w="70%" r={5} />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <SkEl h={18} w={18} r={99} style={{ flexShrink: 0 }} />
            <SkEl h={13} w="85%" r={5} />
          </div>
        ))}
      </div>
    </>
  );
}
