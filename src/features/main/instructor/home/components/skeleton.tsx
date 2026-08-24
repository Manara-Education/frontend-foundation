import { BORDER } from "./theme";

const SHIMMER_CSS = `
  @keyframes ihv-sh {
    0%   { background-position: -640px 0; }
    100% { background-position:  640px 0; }
  }
  .ihv-sk {
    background: linear-gradient(100deg,#EAECF5 0%,#EAECF5 38%,#F4F5FB 52%,#EAECF5 62%,#EAECF5 100%);
    background-size: 640px 100%;
    animation: ihv-sh 1.7s ease-in-out infinite;
  }
`;

function Sk({
  w,
  h,
  r = 10,
  style,
}: {
  w?: number | string;
  h: number | string;
  r?: number;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className="ihv-sk"
      style={{ width: w ?? "100%", height: h, borderRadius: r, flexShrink: 0, ...style }}
    />
  );
}

export function PageSkeleton() {
  return (
    <>
      <style>{SHIMMER_CSS}</style>

      {/* Greeting */}
      <div className="mb-10 flex flex-col gap-3">
        <Sk h={13} w={160} r={6} />
        <Sk h={34} w={300} r={11} />
        <Sk h={16} w={240} r={7} />
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="rounded-3xl p-7"
            style={{ background: "#fff", border: `1px solid ${BORDER}` }}
          >
            <Sk h={44} w={44} r={14} style={{ marginBottom: 20 }} />
            <Sk h={48} w="55%" r={12} style={{ marginBottom: 10 }} />
            <Sk h={14} w="78%" r={6} />
          </div>
        ))}
      </div>

      {/* Section title */}
      <div className="flex items-center mb-5">
        <Sk h={22} w={150} r={8} />
      </div>

      {/* Course rows */}
      <div className="flex flex-col gap-3 mb-10">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex overflow-hidden"
            style={{ background: "#fff", borderRadius: 20, border: `1.5px solid ${BORDER}` }}
          >
            <Sk w={128} h={92} r={0} />
            <div className="flex flex-col gap-2.5 justify-center p-5 flex-1">
              <Sk h={17} w="62%" r={7} />
              <Sk h={12} w="42%" r={5} />
              <Sk h={22} w={58} r={8} />
            </div>
          </div>
        ))}
      </div>

      {/* Banner */}
      <Sk h={176} r={28} />
    </>
  );
}
