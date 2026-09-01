const SHIMMER = `
  @keyframes alv-shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position:  600px 0; }
  }
  .alv-sk {
    background: linear-gradient(100deg,#EAECF5 0%,#EAECF5 35%,#F4F5FB 50%,#EAECF5 65%,#EAECF5 100%);
    background-size: 600px 100%;
    animation: alv-shimmer 1.9s ease-in-out infinite;
  }
`;

function Sk({ w, h, r = 10 }: { w?: number | string; h: number | string; r?: number }) {
  return <div className="alv-sk" style={{ width: w ?? "100%", maxWidth: "100%", height: h, borderRadius: r, flexShrink: 0 }} />;
}

export function PageSkeleton() {
  return (
    <>
      <style>{SHIMMER}</style>
      <div className="rounded-2xl p-4 mb-7 flex items-center gap-3" style={{ background: "#fff", border: "1.5px solid rgba(78,91,146,0.09)", minWidth: 0 }}>
        <Sk w={40} h={40} r={12} />
        <div className="flex flex-col gap-1.5 flex-1" style={{ minWidth: 0 }}>
          <Sk h={14} w={80} r={5} />
          <Sk h={18} w={200} r={7} />
        </div>
      </div>
      {[1, 2].map((i) => (
        <div key={i} className="flex gap-4 rounded-2xl p-4 mb-3" style={{ background: "#fff", border: "1.5px solid rgba(78,91,146,0.09)", minWidth: 0 }}>
          <Sk w="clamp(72px, 24vw, 100px)" h={70} r={12} />
          <div className="flex flex-col gap-2 flex-1" style={{ minWidth: 0 }}>
            <Sk h={16} w="60%" r={7} />
            <Sk h={12} w="80%" r={5} />
          </div>
        </div>
      ))}
    </>
  );
}
