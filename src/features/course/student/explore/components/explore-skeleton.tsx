const BORDER = "rgba(78,91,146,0.09)";

const SHIMMER_CSS = `
  @keyframes acv-sh {
    0%   { background-position: -700px 0; }
    100% { background-position:  700px 0; }
  }
  .acv-sk {
    background: linear-gradient(100deg,#EAECF5 0%,#EAECF5 38%,#F4F5FB 52%,#EAECF5 62%,#EAECF5 100%);
    background-size: 700px 100%;
    animation: acv-sh 1.7s ease-in-out infinite;
  }
`;

function Sk({ w, h, r = 10, style }: { w?: number | string; h: number | string; r?: number; style?: React.CSSProperties }) {
  return (
    <div
      className="acv-sk"
      style={{ width: w ?? "100%", height: h, borderRadius: r, flexShrink: 0, ...style }}
    />
  );
}

function SkeletonCard() {
  return (
    <div
      className="flex overflow-hidden"
      style={{ background: "#fff", borderRadius: 20, border: `1.5px solid ${BORDER}` }}
    >
      <Sk w={128} h={92} r={0} />
      <div className="flex flex-col gap-2.5 justify-center p-5 flex-1">
        <Sk h={17} w="64%" r={7} />
        <Sk h={12} w="42%" r={5} />
        <Sk h={22} w={60} r={8} />
      </div>
    </div>
  );
}

export function ExploreSkeleton() {
  return (
    <>
      <style>{SHIMMER_CSS}</style>

      {/* Header skeleton */}
      <div className="mb-10 flex flex-col gap-3">
        <Sk h={36} w={200} r={11} />
        <Sk h={15} w={280} r={7} />
      </div>

      {/* Search skeleton */}
      <div className="flex gap-3 mb-8">
        <Sk h={48} r={16} style={{ flex: 1 }} />
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </>
  );
}
