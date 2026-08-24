import { ReactNode } from "react";
import { ManaraLogoIcon } from "@/shared/components/ManaraLogo";

interface AuthCardProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  maxWidth?: number;
}

export function AuthCard({ children, title, subtitle, maxWidth = 440 }: AuthCardProps) {
  return (
    <div style={{ width: "100%", maxWidth }}>
      {/* Card header with logo */}
      <div className="flex flex-col items-center mb-8">
        <div
          className="rounded-2xl p-3 mb-5 flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, rgba(78,91,146,0.1) 0%, rgba(78,91,146,0.06) 100%)",
            border: "1px solid rgba(78,91,146,0.12)",
          }}
        >
          <ManaraLogoIcon size={32} color="#4E5B92" />
        </div>
        <h1
          style={{
            fontFamily: "'Cairo', sans-serif",
            fontWeight: 700,
            fontSize: 24,
            color: "#1E2340",
            textAlign: "center",
            lineHeight: 1.5,
            marginBottom: 6,
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            style={{
              fontFamily: "'Cairo', sans-serif",
              fontWeight: 400,
              fontSize: 15,
              color: "#717182",
              textAlign: "center",
              lineHeight: 1.7,
              maxWidth: 340,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* Card body */}
      <div
        className="rounded-3xl p-6 sm:p-8"
        style={{
          background: "#ffffff",
          boxShadow: "0 4px 40px rgba(78,91,146,0.08), 0 1px 8px rgba(0,0,0,0.04)",
          border: "1px solid rgba(78,91,146,0.08)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
