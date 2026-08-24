import { ManaraLogoIcon } from "@/shared/components/ManaraLogo";
import { AUTH_BRAND_PANEL } from "@/features/auth/content/brand-panel.content";

/**
 * The decorative column that sits beside every authentication form.
 *
 * The panel owns its own column: the width and the "is it shown at all"
 * decision live here, on the one element, rather than being split between a
 * sizing wrapper in `AuthLayout` and a `hidden lg:flex` on the panel itself.
 * That split was the bug — below `lg` the panel painted nothing while its
 * wrapper still reserved 480px, so every phone and tablet rendered the form
 * squeezed into whatever was left of the viewport.
 *
 * The width is fluid (`clamp`) instead of two fixed pixel steps, so the panel
 * holds its proportion from a small laptop up to an ultrawide monitor. Height
 * comes from the flex row stretching it, which keeps the gradient covering the
 * full page even when a tall form (sign up) makes the document longer than the
 * viewport.
 */
export function BrandPanel() {
  return (
    <div
      className="hidden lg:flex shrink-0 flex-col relative overflow-hidden"
      style={{
        background: "linear-gradient(160deg, #2D3563 0%, #4E5B92 45%, #6B7AB8 100%)",
        width: "clamp(340px, 36vw, 560px)",
      }}
    >
      {/* Background watermark logo */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ opacity: 0.04 }}
      >
        <ManaraLogoIcon size={480} color="#ffffff" />
      </div>

      {/* Abstract decorative shapes inspired by logo */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 480 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Large arc top-right */}
        <circle cx="520" cy="-60" r="340" stroke="rgba(255,255,255,0.07)" strokeWidth="1.5" fill="none" />
        <circle cx="520" cy="-60" r="280" stroke="rgba(255,255,255,0.05)" strokeWidth="1" fill="none" />

        {/* Bottom-left arc */}
        <circle cx="-80" cy="960" r="420" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" fill="none" />
        <circle cx="-80" cy="960" r="320" stroke="rgba(255,255,255,0.04)" strokeWidth="1" fill="none" />

        {/* Subtle flowing path inspired by logo curves */}
        <path
          d="M0 320 Q120 260 200 340 Q300 440 380 380 Q460 320 480 360"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1"
          fill="none"
        />
        <path
          d="M0 420 Q140 360 220 440 Q320 540 400 480 Q460 440 480 460"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1"
          fill="none"
        />

        {/* Small decorative circles */}
        <circle cx="60" cy="180" r="4" fill="rgba(255,255,255,0.15)" />
        <circle cx="420" cy="700" r="3" fill="rgba(255,255,255,0.12)" />
        <circle cx="240" cy="820" r="5" fill="rgba(255,255,255,0.08)" />
        <circle cx="380" cy="140" r="3" fill="rgba(255,255,255,0.1)" />

        {/* Dot grid subtle */}
        {Array.from({ length: 8 }).map((_, row) =>
          Array.from({ length: 5 }).map((_, col) => (
            <circle
              key={`${row}-${col}`}
              cx={40 + col * 80}
              cy={500 + row * 55}
              r="1.5"
              fill="rgba(255,255,255,0.12)"
            />
          ))
        )}

        {/* Glowing soft blob top */}
        <ellipse cx="380" cy="80" rx="160" ry="100" fill="rgba(255,255,255,0.03)" />
        {/* Glowing soft blob bottom */}
        <ellipse cx="100" cy="820" rx="180" ry="120" fill="rgba(255,255,255,0.03)" />
      </svg>

      {/* Top logo */}
      <div className="relative z-10 p-8 xl:p-10 flex items-center gap-3 shrink-0" dir="rtl">
        <ManaraLogoIcon size={36} color="rgba(255,255,255,0.95)" />
        <div style={{ fontFamily: "'Cairo', sans-serif" }}>
          <div style={{ color: "rgba(255,255,255,0.95)", fontWeight: 700, fontSize: 20 }}>منارة</div>
          <div style={{ color: "rgba(255,255,255,0.55)", fontWeight: 400, fontSize: 11, letterSpacing: 1.5 }}>
            MANARA
          </div>
        </div>
      </div>

      {/*
        Center content. `min-h-0` lets this block shrink below its content on a
        short viewport instead of being silently cut off by the panel's
        `overflow-hidden`, and `m-auto` on the inner block centres it while
        there is room to spare without making the top unreachable once there
        is not — which plain `justify-center` in a scroll container does.
      */}
      <div
        className="relative z-10 flex-1 min-h-0 overflow-y-auto flex flex-col px-8 xl:px-12 py-6 text-center"
        dir="rtl"
      >
        <div className="m-auto flex flex-col items-center">
          {/* Central logo glow */}
          <div className="relative mb-10">
            <div
              className="absolute inset-0 rounded-full blur-3xl"
              style={{
                background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)",
                transform: "scale(2.5)",
              }}
            />
            <div
              className="relative rounded-3xl p-6 flex items-center justify-center"
              style={{
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.15)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
              }}
            >
              <ManaraLogoIcon size={72} color="rgba(255,255,255,0.92)" />
            </div>
          </div>

          <h2
            style={{
              fontFamily: "'Cairo', sans-serif",
              color: "rgba(255,255,255,0.95)",
              fontWeight: 700,
              fontSize: 28,
              lineHeight: 1.6,
              marginBottom: 16,
            }}
          >
            {AUTH_BRAND_PANEL.heading}
          </h2>
          <p
            style={{
              fontFamily: "'Cairo', sans-serif",
              color: "rgba(255,255,255,0.6)",
              fontWeight: 400,
              fontSize: 16,
              lineHeight: 1.8,
              maxWidth: 320,
            }}
          >
            {AUTH_BRAND_PANEL.tagline}
          </p>

          {/* Decorative divider */}
          <div className="flex items-center gap-3 mt-8">
            <div style={{ width: 40, height: 1, background: "rgba(255,255,255,0.25)" }} />
            <ManaraLogoIcon size={14} color="rgba(255,255,255,0.4)" />
            <div style={{ width: 40, height: 1, background: "rgba(255,255,255,0.25)" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
