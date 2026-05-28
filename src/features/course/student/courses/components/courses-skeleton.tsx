import { SHIMMER_CSS } from "../formatters/courses.formatter";

function Sk({
  w,
  h,
  r = 10,
  style = {},
}: {
  w?: number | string;
  h: number | string;
  r?: number;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className="cv-sk"
      style={{ width: w ?? "100%", height: h, borderRadius: r, flexShrink: 0, ...style }}
    />
  );
}

export function CoursesSkeleton() {
  return (
    <>
      <style>{SHIMMER_CSS}</style>

      {/* Welcome banner */}
      <Sk h={92} r={22} style={{ marginBottom: 28 }} />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Sk h={32} w={140} r={12} />
          <Sk h={16} w={220} r={8} />
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {[1, 2, 3].map((i) => (
            <Sk key={i} h={64} w={100} r={16} />
          ))}
        </div>
      </div>

      {/* Search + filters */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
        <Sk h={48} r={16} />
        <div style={{ display: "flex", gap: 8 }}>
          {[1, 2, 3, 4].map((i) => (
            <Sk key={i} h={36} w={90} r={99} />
          ))}
        </div>
      </div>

      {/* Cards grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 20 }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            style={{ borderRadius: 20, overflow: "hidden", background: "#fff", border: "1px solid #ECECEC" }}
          >
            <Sk h={160} r={0} />
            <div style={{ padding: "16px 16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
              <Sk h={18} w="80%" r={7} />
              <Sk h={13} w="55%" r={6} />
              <Sk h={12} w="95%" r={5} />
              <Sk h={12} w="70%" r={5} />
              <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 6 }}>
                <Sk h={5} r={99} />
                <Sk h={11} w="50%" r={5} />
              </div>
              <Sk h={38} r={12} style={{ marginTop: 4 }} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
