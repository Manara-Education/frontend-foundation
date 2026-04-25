import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { getProfile, updateProfile } from "../services/profile.service";

export function useProfile() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [draftName, setDraftName] = useState("");

  useEffect(() => {
    getProfile()
      .then((profile) => {
        setName(profile.fullName);
        setEmail(profile.email);
        setRole(profile.role);
        setCreatedAt(profile.createdAt);
        setDraftName(profile.fullName);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const openEdit = useCallback(() => {
    setDraftName(name);
    setIsEditing(true);
  }, [name]);

  const saveEdit = useCallback(async () => {
    const trimmed = draftName.trim();
    if (!trimmed) return;

    await updateProfile({ fullName: trimmed });
    setName(trimmed);
    setIsEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  }, [draftName]);

  const cancelEdit = useCallback(() => {
    setIsEditing(false);
    setDraftName(name);
  }, [name]);

  const navigateToResetPassword = useCallback(() => {
    navigate("/reset-password", { state: { from: "profile" } });
  }, [navigate]);

  return {
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
  };
}
