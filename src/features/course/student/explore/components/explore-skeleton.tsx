/**
 * The loading shape of the explore screen. It mirrors what actually arrives: breadcrumb,
 * icon-tile heading, the 52px search field, and a grid of tiles with a 16:9 cover — the
 * same grid template the loaded page uses, so nothing shifts when the data lands.
 */
import { BORDER } from "../formatters/explore.formatter";

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

const GRID_STYLE: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(min(250px, 100%), 1fr))",
  gap: 22,
};

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
      className="acv-sk"
      style={{ width: w ?? "100%", height: h, borderRadius: r, flexShrink: 0, ...style }}
    />
  );
}

function SkeletonCard() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        borderRadius: 22,
        overflow: "hidden",
        background: "#fff",
        border: `1.5px solid ${BORDER}`,
      }}
    >
      {/* Cover — the same 16:9 box the card holds */}
      <div style={{ position: "relative", paddingTop: "56.25%" }}>
        <Sk h="100%" r={0} style={{ position: "absolute", inset: 0 }} />
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 11,
          padding: "18px 18px 20px",
        }}
      >
        {/* Instructor row */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Sk w={18} h={18} r={9} />
          <Sk h={12} w="45%" r={5} />
        </div>

        {/* Title, two lines */}
        <Sk h={15} w="88%" r={6} />
        <Sk h={15} w="62%" r={6} />

        {/* Description, two lines */}
        <Sk h={11} w="100%" r={4} />
        <Sk h={11} w="72%" r={4} />

        {/* Meta row */}
        <div style={{ display: "flex", gap: 12 }}>
          <Sk h={11} w={54} r={4} />
          <Sk h={11} w={48} r={4} />
          <Sk h={11} w={60} r={4} />
        </div>

        {/* Price badge + CTA */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
          <Sk h={20} w={62} r={99} />
          <Sk h={32} w={92} r={12} />
        </div>
      </div>
    </div>
  );
}

export function ExploreSkeleton() {
  return (
    <div dir="rtl">
      <style>{SHIMMER_CSS}</style>

      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
        <Sk h={13} w={55} r={5} />
        <Sk h={10} w={8} r={3} />
        <Sk h={13} w={100} r={5} />
      </div>

      {/* Heading — icon tile + title, then the subtitle indented past the tile */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
          <Sk w={44} h={44} r={14} />
          <Sk h={30} w={280} r={11} />
        </div>
        <Sk h={15} w={380} r={7} style={{ marginInlineStart: 56, maxWidth: "100%" }} />
      </div>

      {/* Search */}
      <Sk h={52} r={18} style={{ marginBottom: 36 }} />

      {/* Grid */}
      <div style={GRID_STYLE}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
