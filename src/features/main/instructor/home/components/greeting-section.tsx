import { motion } from "motion/react";
import { FONT, TEXT_DARK, TEXT_MID } from "./theme";

interface GreetingSectionProps {
  firstName: string;
}

export function GreetingSection({ firstName }: GreetingSectionProps) {
  return (
    <section className="mb-10">
      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        style={{
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 30,
          color: TEXT_DARK,
          lineHeight: 1.3,
          letterSpacing: -0.3,
        }}
      >
        مرحبًا بعودتك، {firstName} 👋
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        style={{
          fontFamily: FONT,
          fontSize: 15,
          color: TEXT_MID,
          marginTop: 7,
          lineHeight: 1.7,
        }}
      >
        استمر في مشاركة المعرفة وصناعة الأثر
      </motion.p>
    </section>
  );
}
