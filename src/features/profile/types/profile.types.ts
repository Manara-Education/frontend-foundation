import type { ElementType } from "react";

/* ── API types (mirrors backend DTOs) ─────────────────────── */

export interface ProfileResponse {
  fullName: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface UpdateProfileRequest {
  fullName: string;
}

/* ── Domain/view shape returned by the service ────────────── */

export interface Profile {
  fullName: string;
  email: string;
  roleLabel: string;
  memberSince: string;
}

/* ── Component props ──────────────────────────────────────── */

export interface ProfileContentProps {
  isLoading: boolean;
  isEditing: boolean;
  saved: boolean;
  name: string;
  email: string;
  roleLabel: string;
  memberSince: string;
  draftName: string;
  setDraftName: (v: string) => void;
  openEdit: () => void;
  saveEdit: () => void;
  cancelEdit: () => void;
  navigateToResetPassword: () => void;
}

export interface SettingsRowProps {
  icon: ElementType;
  iconBg: string;
  iconColor: string;
  label: string;
  description?: string;
  onClick?: () => void;
}

export interface ProfileFieldProps {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  readOnly?: boolean;
  placeholder?: string;
}
