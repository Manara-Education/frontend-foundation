import { motion, AnimatePresence } from "motion/react";
import { User, Lock, Pencil, Check, X } from "lucide-react";
import { ManaraLogoIcon } from "@/shared/components/ManaraLogo.tsx";
import { ProfileSkeleton } from "./profile-skeleton.tsx";
import { SettingsRow } from "./settings-row.tsx";
import { ProfileField } from "./profile-field.tsx";
import type { ProfileContentProps } from "@/features/profile/types/profile.types.ts";

const PRIMARY = "#4E5B92";

function formatMemberSince(iso: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  return date.toLocaleDateString("ar-EG", { month: "long", year: "numeric" });
}

function getRoleBadge(role: string): string {
  const map: Record<string, string> = { STUDENT: "طالب نشط", ADMIN: "مسؤول", TEACHER: "معلم" };
  return map[role] ?? role;
}

export function ProfileContent({
  isLoading,
  isEditing,
  saved,
  name,
  email,
  role,
  createdAt,
  draftName,
  setDraftName,
  openEdit,
  saveEdit,
  cancelEdit,
  navigateToResetPassword,
}: ProfileContentProps) {
  return (
    <div dir="rtl" style={{ fontFamily: "'Cairo', sans-serif" }}>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <ProfileSkeleton />
          </motion.div>
        ) : (
          <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="flex flex-col gap-6">

            {/* ── PAGE TITLE ────────────────────────────────────────── */}
            <div>
              <h1 style={{ fontWeight: 700, fontSize: 24, color: "#1E2340", lineHeight: 1.3 }}>ملفي الشخصي</h1>
              <p style={{ fontSize: 14, color: "#717182", marginTop: 4 }}>إدارة حسابك بسهولة</p>
            </div>

            {/* ── IDENTITY CARD ─────────────────────────────────────── */}
            <div className="overflow-hidden relative" style={{ borderRadius: 24, background: "#ffffff", border: "1.5px solid rgba(78,91,146,0.09)", boxShadow: "0 4px 24px rgba(78,91,146,0.08)" }}>
              {/* Cover */}
              <div className="relative overflow-hidden" style={{ height: 96 }}>
                <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #2D3563 0%, #4E5B92 55%, #7080B8 100%)" }} />
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 640 96" preserveAspectRatio="xMidYMid slice" fill="none">
                  <circle cx="580" cy="-20" r="120" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                  <circle cx="60" cy="120" r="100" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                </svg>
                <div className="absolute pointer-events-none" style={{ left: 12, bottom: -20, opacity: 0.07 }}>
                  <ManaraLogoIcon size={100} color="#ffffff" />
                </div>
              </div>

              {/* Body */}
              <div className="flex flex-col items-center px-6 pb-7" style={{ marginTop: -42 }}>
                {/* Avatar */}
                <div className="rounded-full flex items-center justify-center flex-shrink-0" style={{ width: 84, height: 84, background: "linear-gradient(135deg, #3A4880 0%, #6B7AB8 100%)", color: "white", fontWeight: 700, fontSize: 30, border: "4px solid #ffffff", boxShadow: "0 4px 18px rgba(78,91,146,0.2)", position: "relative" }}>
                  {name.charAt(0)}
                  <div className="absolute rounded-full" style={{ width: 14, height: 14, background: "#27AE60", border: "2.5px solid #ffffff", bottom: 3, left: 3 }} />
                </div>

                <AnimatePresence mode="wait">
                  {!isEditing ? (
                    <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="flex flex-col items-center gap-1 mt-3 w-full">
                      <h2 style={{ fontWeight: 700, fontSize: 20, color: "#1E2340" }}>{name}</h2>
                      <span style={{ fontSize: 13, color: "#9BA3C4" }}>{email}</span>
                      <div className="flex items-center gap-1.5 rounded-full px-3.5 py-1 mt-1.5" style={{ background: "rgba(78,91,146,0.08)", border: "1px solid rgba(78,91,146,0.12)" }}>
                        <div className="rounded-full" style={{ width: 6, height: 6, background: "#27AE60" }} />
                        <span style={{ fontWeight: 600, fontSize: 11, color: PRIMARY }}>{getRoleBadge(role)}</span>
                      </div>
                      <button
                        onClick={openEdit}
                        className="flex items-center gap-2 rounded-2xl px-6 py-2.5 transition-all duration-150 mt-4"
                        style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 13, background: PRIMARY, color: "#ffffff", border: "none", cursor: "pointer", boxShadow: "0 3px 14px rgba(78,91,146,0.26)" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "#3D4A80"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = PRIMARY; }}
                      >
                        <Pencil size={13} />
                        تعديل الملف الشخصي
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div key="edit" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="w-full flex flex-col gap-3 mt-4">
                      <ProfileField label="الاسم الكامل" value={draftName} onChange={setDraftName} placeholder="أدخل اسمك الكامل" />
                      <ProfileField label="البريد الإلكتروني" value={email} readOnly />
                      <div className="flex gap-2.5 mt-1">
                        <button onClick={saveEdit} className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 transition-all duration-150" style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 13, background: PRIMARY, color: "#ffffff", border: "none", cursor: "pointer" }} onMouseEnter={(e) => { e.currentTarget.style.background = "#3D4A80"; }} onMouseLeave={(e) => { e.currentTarget.style.background = PRIMARY; }}>
                          <Check size={14} /> حفظ التغييرات
                        </button>
                        <button onClick={cancelEdit} className="flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 transition-all duration-150" style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: 13, background: "rgba(78,91,146,0.07)", color: "#717182", border: "1.5px solid rgba(78,91,146,0.1)", cursor: "pointer" }} onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(78,91,146,0.12)"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(78,91,146,0.07)"; }}>
                          <X size={14} /> إلغاء
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* ── SAVED TOAST ───────────────────────────────────────── */}
            <AnimatePresence>
              {saved && (
                <motion.div initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="flex items-center gap-3 rounded-2xl px-4 py-3" style={{ background: "rgba(39,174,96,0.09)", border: "1.5px solid rgba(39,174,96,0.18)" }}>
                  <div className="rounded-full flex items-center justify-center flex-shrink-0" style={{ width: 26, height: 26, background: "rgba(39,174,96,0.14)", color: "#27AE60" }}>
                    <Check size={13} />
                  </div>
                  <span style={{ fontWeight: 600, fontSize: 13, color: "#1B7A43" }}>تم حفظ التغييرات بنجاح</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── SETTINGS ──────────────────────────────────────────── */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2.5">
                <span style={{ fontWeight: 700, fontSize: 15, color: "#1E2340" }}>إعدادات الحساب</span>
                <div className="flex-1 rounded-full" style={{ height: 1, background: "rgba(78,91,146,0.1)" }} />
              </div>
              <div style={{ borderRadius: 18, background: "#ffffff", border: "1.5px solid rgba(78,91,146,0.08)", boxShadow: "0 2px 12px rgba(78,91,146,0.05)", overflow: "hidden" }}>
                <SettingsRow icon={User} iconBg="rgba(78,91,146,0.08)" iconColor={PRIMARY} label="تعديل الملف الشخصي" description="الاسم والمعلومات الشخصية" onClick={openEdit} />
                <div style={{ height: 1, background: "rgba(78,91,146,0.06)", margin: "0 18px" }} />
                <SettingsRow icon={Lock} iconBg="rgba(232,160,32,0.1)" iconColor="#E8A020" label="تغيير كلمة المرور" description="تحديث كلمة المرور الخاصة بك" onClick={navigateToResetPassword} />
              </div>
            </div>

            {/* ── MEMBER SINCE ──────────────────────────────────────── */}
            <div className="rounded-2xl px-5 py-3.5 flex items-center justify-between" style={{ background: "rgba(78,91,146,0.04)", border: "1.5px solid rgba(78,91,146,0.08)" }}>
              <div className="flex flex-col gap-0.5">
                <span style={{ fontSize: 12, color: "#717182" }}>عضو منذ</span>
                <span style={{ fontWeight: 700, fontSize: 14, color: "#1E2340" }}>{formatMemberSince(createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <ManaraLogoIcon size={20} color="rgba(78,91,146,0.28)" />
                <span style={{ fontSize: 12, color: "#B0B7D4" }}>منارة</span>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
