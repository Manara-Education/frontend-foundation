const SHIMMER = `
  @keyframes hv-shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position:  600px 0; }
  }
  .hv-sk {
    background: linear-gradient(100deg,#EAECF5 0%,#EAECF5 35%,#F4F5FB 50%,#EAECF5 65%,#EAECF5 100%);
    background-size: 600px 100%;
    animation: hv-shimmer 1.9s ease-in-out infinite;
  }
`;

function Sk({ w, h, r = 10, style = {} }: { w?: number | string; h: number | string; r?: number; style?: React.CSSProperties }) {
  return <div className="hv-sk" style={{ width: w ?? "100%", height: h, borderRadius: r, flexShrink: 0, ...style }} />;
}

export function HomeSkeleton() {
  return (
    <>
      <style>{SHIMMER}</style>
      {/* Welcome */}
      <div className="flex flex-col gap-2 mb-6">
        <Sk h={28} w={200} r={10} />
        <Sk h={15} w={280} r={7} />
      </div>

      {/* Hero card */}
      <div className="rounded-3xl overflow-hidden mb-8" style={{ height: 200 }}>
        <Sk h={200} r={0} />
      </div>

      {/* Section title */}
      <div className="flex items-center justify-between mb-4">
        <Sk h={20} w={140} r={8} />
        <Sk h={16} w={60} r={7} />
      </div>

      {/* Enrolled cards */}
      <div className="flex gap-4 overflow-hidden mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex-shrink-0 rounded-2xl overflow-hidden" style={{ width: 200 }}>
            <Sk h={110} r={0} />
            <div style={{ background: "#fff", padding: "12px 12px 14px" }} className="flex flex-col gap-2">
              <Sk h={14} w="80%" r={6} />
              <Sk h={11} w="60%" r={5} />
              <Sk h={6} r={99} style={{ marginTop: 6 }} />
            </div>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      <div className="flex items-center justify-between mb-4">
        <Sk h={20} w={120} r={8} />
        <Sk h={16} w={60} r={7} />
      </div>
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl overflow-hidden">
            <Sk h={140} r={0} />
            <div style={{ background: "#fff", padding: "14px" }} className="flex flex-col gap-2">
              <Sk h={15} w="75%" r={6} />
              <Sk h={12} w="90%" r={5} />
              <Sk h={12} w="60%" r={5} />
              <Sk h={36} r={10} style={{ marginTop: 6 }} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
