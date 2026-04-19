import { ReactNode } from "react";
import { BrandPanel } from "./BrandPanel";
import { ManaraLogoFull } from "@/shared/components/ManaraLogo";
import { NavDemo } from "@/app/components/auth/NavDemo";

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div
      className="flex min-h-screen w-full"
      dir="rtl"
      style={{ fontFamily: "'Cairo', sans-serif", background: "#F6F7FC" }}
    >
      {/* Right: Form Panel */}
      <div className="flex-1 flex flex-col min-h-screen relative">
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
        <div className="flex-1 flex items-center justify-center px-6 py-10 relative z-10">
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

      {/* Left: Brand Panel (RTL — left is the decorative side) */}
      <div className="w-[480px] xl:w-[520px] flex-shrink-0">
        <BrandPanel />
      </div>
    </div>
  );
}