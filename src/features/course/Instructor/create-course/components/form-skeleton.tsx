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
      className="ccv-sk"
      style={{
        width: w ?? "100%",
        maxWidth: "100%",
        minWidth: 0,
        height: h,
        borderRadius: r,
        flexShrink: 0,
        ...style,
      }}
    />
  );
}

export function FormSkeleton() {
  return (
    <>
      <style>{SHIMMER_CSS}</style>
      <div className="flex flex-col gap-2 mb-8">
        <Sk h={32} w="min(280px, 100%)" r={10} />
        <Sk h={16} w="min(360px, 100%)" r={7} />
      </div>
      <div
        className="rounded-3xl mb-6"
        style={{
          background: "#fff",
          border: "1px solid rgba(78,91,146,0.08)",
          padding: "clamp(18px, 5vw, 32px)",
          minWidth: 0,
          maxWidth: "100%",
        }}
      >
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
        <div
          className="rs-cluster mt-8"
          style={{ "--rs-cluster-gap": "12px", justifyContent: "flex-start" } as React.CSSProperties}
        >
          <Sk h={46} w="min(140px, 100%)" r={14} style={{ flex: "1 1 140px" }} />
          <Sk h={46} w="min(100px, 100%)" r={14} style={{ flex: "1 1 100px" }} />
        </div>
      </div>
      <Sk h={60} r={16} />
    </>
  );
}
