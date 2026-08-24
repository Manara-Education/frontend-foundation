import { ReactNode } from "react";
import { BrandPanel } from "./BrandPanel";
import { ManaraLogoFull } from "@/shared/components/ManaraLogo";


interface AuthLayoutProps {
  children: ReactNode;
}

/**
 * The frame every authentication screen is rendered into: the form on the
 * reading side, the brand panel on the other.
 *
 * The two columns are the flex row's only children — the panel is not wrapped
 * in a sizing box, because a wrapper that reserves width while its contents
 * are hidden is exactly what made this layout unusable below `lg`. Sizing and
 * visibility belong to `BrandPanel` itself; this file decides only the order.
 */
export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div
      className="flex min-h-dvh w-full"
      dir="rtl"
      style={{ fontFamily: "'Cairo', sans-serif", background: "#F6F7FC" }}
    >
      {/*
        Right: Form Panel. `min-w-0` overrides a flex item's automatic minimum
        size so the column can narrow to the viewport rather than pushing the
        page sideways, and the height comes from the row stretching it.
      */}
      <div className="flex-1 min-w-0 flex flex-col relative">
        {/* Subtle background pattern */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 80% 20%, rgba(78,91,146,0.04) 0%, transparent 60%),
                              radial-gradient(circle at 20% 80%, rgba(78,91,146,0.03) 0%, transparent 50%)`,
          }}
        />

        {/* Mobile header with logo */}
        <div className="lg:hidden flex items-center justify-end px-6 pt-6 pb-2 relative z-10">
          <ManaraLogoFull size={36} />
        </div>

        {/* Form content */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-10 relative z-10">
          {children}
        </div>

        {/* Footer */}
        <div
          className="relative z-10 text-center pb-6 px-6"
          style={{ fontFamily: "'Cairo', sans-serif", color: "#9BA3C4", fontSize: 13 }}
        >
          © ٢٠٢٦ منارة — جميع الحقوق محفوظة
        </div>
      </div>

      {/* Left: Brand Panel (RTL — left is the decorative side). Hidden below `lg`,
          where it takes no space at all rather than an empty column. */}
      <BrandPanel />
    </div>
  );
}
