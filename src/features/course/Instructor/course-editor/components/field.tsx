import { motion, AnimatePresence } from "motion/react";

const FONT = "'Cairo', sans-serif";

interface FieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}

export function Field({ label, required, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        style={{
          fontFamily: FONT,
          fontWeight: 600,
          fontSize: 13.5,
          color: "#1E2340",
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        {label}
        {required && (
          <span style={{ color: "#D4183D", fontSize: 14, lineHeight: 1 }}>*</span>
        )}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.18 }}
            style={{ fontFamily: FONT, fontSize: 12, color: "#D4183D", marginTop: 1 }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
