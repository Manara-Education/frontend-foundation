const SHIMMER = `
  @keyframes cdv-shimmer {
    0%   { background-position: -700px 0; }
    100% { background-position:  700px 0; }
  }
  .cdv-sk {
    background: linear-gradient(100deg,#EAECF5 0%,#EAECF5 35%,#F4F5FB 50%,#EAECF5 65%,#EAECF5 100%);
    background-size: 700px 100%;
    animation: cdv-shimmer 1.9s ease-in-out infinite;
  }
`;

function Sk({ w, h, r = 10, style = {} }: { w?: number | string; h: number | string; r?: number; style?: React.CSSProperties }) {
  return <div className="cdv-sk" style={{ width: w ?? "100%", height: h, borderRadius: r, flexShrink: 0, ...style }} />;
}

export function DetailSkeleton() {
  return (
    <>
      <style>{SHIMMER}</style>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
        <Sk h={14} w={60} r={6} />
        <Sk h={14} w={8} r={3} />
        <Sk h={14} w={50} r={6} />
        <Sk h={14} w={8} r={3} />
        <Sk h={14} w={90} r={6} />
      </div>
      <Sk h={280} r={24} style={{ marginBottom: 24 }} />
      <Sk h={120} r={20} style={{ marginBottom: 24 }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
        <Sk h={20} w={140} r={8} style={{ marginBottom: 4 }} />
        {[1, 2, 3, 4, 5].map((i) => <Sk key={i} h={64} r={16} />)}
      </div>
      <Sk h={160} r={20} style={{ marginBottom: 24 }} />
      <Sk h={140} r={20} />
    </>
  );
}
