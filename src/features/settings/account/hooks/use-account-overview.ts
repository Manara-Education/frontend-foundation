import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/shared/auth";
import type { Profile } from "@/features/profile/types/profile.types";
import { useLocation, useNavigate } from "react-router";
import { paths } from "@/shared/navigation/paths";
import { getAccountOverview, toAccountOverview } from "../services/account.service";
import type { AccountNotice, AccountOverview, LoadState } from "../types/account.types";

export function useAccountOverview() {
  const navigate = useNavigate();
  const location = useLocation();
  const [account, setAccount] = useState<AccountOverview | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [photoOpen, setPhotoOpen] = useState(false);
  const { user, setUser } = useAuth();

  const notice = (location.state as { notice?: AccountNotice } | null)?.notice ?? null;

  const load = useCallback(() => {
    setLoadState("loading");
    getAccountOverview()
      .then((overview) => {
        setAccount(overview);
        setLoadState("ready");
      })
      .catch(() => setLoadState("error"));
  }, []);

  useEffect(load, [load]);

  const dismissNotice = useCallback(() => {
    navigate(location.pathname, { replace: true, state: null });
  }, [navigate, location.pathname]);

  /** A photo change answers with the whole profile; the screen and the shell both adopt it. */
  const onPhotoSaved = useCallback(
    (profile: Profile) => {
      setAccount(toAccountOverview(profile));
      if (user) setUser({ ...user, fullName: profile.fullName, avatarUrl: profile.avatarUrl });
    },
    [user, setUser],
  );

  return {
    account,
    photoOpen,
    openPhotoEditor: () => setPhotoOpen(true),
    closePhotoEditor: () => setPhotoOpen(false),
    onPhotoSaved,
    loadState,
    retry: load,
    notice,
    dismissNotice,
    openNameEditor: () => navigate(paths.settings.accountName),
    openPasswordEditor: () => navigate(paths.settings.accountPassword),
    openEmailEditor: () => navigate(paths.settings.accountEmail),
  };
}
