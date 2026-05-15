import type { CSSProperties } from "react";
import { LP_SHIMMER } from "./lesson-player.constants";

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

export function LessonPlayerSkeleton() {
  return (
    <>
      <style>{LP_SHIMMER}</style>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
        {[60, 8, 50, 8, 80, 8, 120].map((w, i) => (
          <SkEl key={i} h={13} w={w} r={5} />
        ))}
      </div>
      <div className="lp-two-col">
        {/* Right: curriculum skeleton */}
        <div className="lp-curriculum-col" style={{ order: 0 }}>
          <div
            style={{
              borderRadius: 20,
              background: "#fff",
              border: "1.5px solid #ECECEC",
              padding: 20,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <SkEl h={20} w={140} r={8} />
            <SkEl h={12} w={100} r={6} />
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <SkEl h={28} w={28} r={9} style={{ flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <SkEl h={12} w="85%" r={5} style={{ marginBottom: 5 }} />
                  <SkEl h={10} w="40%" r={4} />
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Left: main content skeleton */}
        <div className="lp-main-col">
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
            <SkEl h={13} w={80} r={6} style={{ marginBottom: 12 }} />
            <SkEl h={26} w="75%" r={8} style={{ marginBottom: 10 }} />
            <SkEl h={13} w={180} r={6} style={{ marginBottom: 6 }} />
            <SkEl h={5} r={99} style={{ marginBottom: 4 }} />
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
              padding: "20px 24px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <SkEl h={18} w={140} r={7} />
            <SkEl h={13} w="95%" r={5} />
            <SkEl h={13} w="80%" r={5} />
            <SkEl h={13} w="90%" r={5} />
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <SkEl h={18} w={18} r={99} style={{ flexShrink: 0 }} />
                <SkEl h={13} w="85%" r={5} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
