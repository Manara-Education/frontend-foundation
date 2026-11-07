import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { paths } from "@/shared/navigation/paths";
import { getAccountOverview } from "../services/account.service";
import type { AccountNotice, AccountOverview, LoadState } from "../types/account.types";

export function useAccountOverview() {
  const navigate = useNavigate();
  const location = useLocation();
  const [account, setAccount] = useState<AccountOverview | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");

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

  return {
    account,
    loadState,
    retry: load,
    notice,
    dismissNotice,
    openNameEditor: () => navigate(paths.settings.accountName),
    openPasswordEditor: () => navigate(paths.settings.accountPassword),
  };
}
