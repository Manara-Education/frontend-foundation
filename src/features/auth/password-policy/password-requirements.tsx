import { Check } from "lucide-react";
import { PASSWORD_REQUIREMENTS, PASSWORD_REQUIREMENTS_TITLE, evaluatePassword } from "./password-policy";

const PRIMARY = "#4E5B92";

interface PasswordRequirementsProps {
  password: string;
  /** For the password field's `aria-describedby`, so the requirements are read out with it. */
  id?: string;
}

/**
 * The password requirements as a checklist that ticks off while the person types. Shared by every
 * screen that sets a password, so the rules look and read the same wherever they are asked for.
 */
export function PasswordRequirements({ password, id }: PasswordRequirementsProps) {
  const state = evaluatePassword(password);

  return (
    <div
      id={id}
      className="rounded-xl p-4 flex flex-col gap-2"
      style={{ background: "#F6F7FC", border: "1px solid rgba(78,91,146,0.08)" }}
    >
      <p
        style={{
          fontFamily: "'Cairo', sans-serif",
          fontWeight: 600,
          fontSize: 13,
          color: "#2C3156",
          marginBottom: 4,
        }}
      >
        {PASSWORD_REQUIREMENTS_TITLE}
      </p>
      <ul className="flex flex-col gap-2">
        {PASSWORD_REQUIREMENTS.map((requirement) => {
          const met = state[requirement.id];
          return (
            <li key={requirement.id} className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200"
                style={{
                  width: 18,
                  height: 18,
                  background: met ? PRIMARY : "transparent",
                  border: `1.5px solid ${met ? PRIMARY : "rgba(78,91,146,0.2)"}`,
                }}
              >
                {met && <Check size={10} color="white" strokeWidth={3} />}
              </span>
              <span
                style={{
                  fontFamily: "'Cairo', sans-serif",
                  fontSize: 12,
                  color: met ? PRIMARY : "#717182",
                  fontWeight: met ? 500 : 400,
                  transition: "color 0.2s",
                }}
              >
                {requirement.label}
              </span>
              {/* The tick is drawn, not said; this says it. */}
              <span className="sr-only">{met ? "مستوفى" : "غير مستوفى"}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
