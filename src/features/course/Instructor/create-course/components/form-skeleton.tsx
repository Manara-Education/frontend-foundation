const SHIMMER_CSS = `
  @keyframes ccv-shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position:  600px 0; }
  }
  .ccv-sk {
    background: linear-gradient(100deg,#EAECF5 0%,#EAECF5 35%,#F4F5FB 50%,#EAECF5 65%,#EAECF5 100%);
    background-size: 600px 100%;
    animation: ccv-shimmer 1.9s ease-in-out infinite;
  }
`;

function Sk({ w, h, r = 10, style = {} }: { w?: number | string; h: number | string; r?: number; style?: React.CSSProperties }) {
  return <div className="ccv-sk" style={{ width: w ?? "100%", height: h, borderRadius: r, flexShrink: 0, ...style }} />;
}

export function FormSkeleton() {
  return (
    <>
      <style>{SHIMMER_CSS}</style>
      <div className="flex flex-col gap-2 mb-8">
        <Sk h={32} w={280} r={10} />
        <Sk h={16} w={360} r={7} />
      </div>
      <div className="rounded-3xl p-8 mb-6" style={{ background: "#fff", border: "1px solid rgba(78,91,146,0.08)" }}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Sk h={14} w={100} r={6} />
            <Sk h={48} r={14} />
          </div>
          <div className="flex flex-col gap-2">
            <Sk h={14} w={120} r={6} />
            <Sk h={100} r={14} />
          </div>
          <div className="flex flex-col gap-2">
            <Sk h={14} w={90} r={6} />
            <Sk h={140} r={14} />
          </div>
        </div>
        <div className="flex justify-start gap-3 mt-8">
          <Sk h={46} w={140} r={14} />
          <Sk h={46} w={100} r={14} />
        </div>
      </div>
      <Sk h={60} r={16} />
    </>
  );
}
