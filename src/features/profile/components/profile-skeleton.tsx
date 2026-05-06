const SHIMMER = `
  @keyframes pv-shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position:  600px 0; }
  }
  .pv-sk {
    background: linear-gradient(100deg,#EAECF5 0%,#EAECF5 35%,#F4F5FB 50%,#EAECF5 65%,#EAECF5 100%);
    background-size: 600px 100%;
    animation: pv-shimmer 1.9s ease-in-out infinite;
  }
`;

function Sk({ w, h, r = 10, style = {} }: { w?: number | string; h: number | string; r?: number; style?: React.CSSProperties }) {
  return <div className="pv-sk" style={{ width: w ?? "100%", height: h, borderRadius: r, flexShrink: 0, ...style }} />;
}

export function ProfileSkeleton() {
  return (
    <>
      <style>{SHIMMER}</style>
      {/* Page title */}
      <div className="flex flex-col gap-2 mb-7">
        <Sk h={26} w={160} r={10} />
        <Sk h={14} w={220} r={7} />
      </div>

      {/* Identity card */}
      <div className="rounded-3xl overflow-hidden mb-6" style={{ border: "1.5px solid rgba(78,91,146,0.07)", background: "#fff" }}>
        <Sk h={96} r={0} style={{ opacity: 0.8 }} />
        <div className="flex flex-col items-center px-6 pb-7" style={{ marginTop: -40 }}>
          <Sk h={80} w={80} r={99} style={{ border: "4px solid #fff" }} />
          <div className="flex flex-col items-center gap-2 mt-4">
            <Sk h={20} w={150} r={9} />
            <Sk h={13} w={190} r={7} />
          </div>
          <Sk h={24} w={76} r={99} style={{ marginTop: 12 }} />
          <Sk h={42} w={190} r={13} style={{ marginTop: 18 }} />
        </div>
      </div>

      {/* Settings */}
      <Sk h={16} w={120} r={7} style={{ marginBottom: 12 }} />
      <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: "1.5px solid rgba(78,91,146,0.07)" }}>
        {[1, 2].map((i, idx) => (
          <div key={i}>
            {idx > 0 && <div style={{ height: 1, background: "rgba(78,91,146,0.06)", margin: "0 18px" }} />}
            <div className="flex items-center gap-4 px-5 py-4">
              <Sk h={38} w={38} r={12} />
              <div className="flex flex-col gap-1.5 flex-1">
                <Sk h={13} w="42%" r={6} />
                <Sk h={11} w="62%" r={5} />
              </div>
              <Sk h={16} w={16} r={5} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
