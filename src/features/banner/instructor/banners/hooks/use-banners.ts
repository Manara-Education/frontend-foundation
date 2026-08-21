import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/shared/api";
import { bannersService } from "../services/banners.service";
import type { BannersSubView, InstructorBanner } from "../types/banners.types";

/**
 * The management screen's list: what is in it, and everything that can be done to a row.
 *
 * Every action goes to the server and re-reads what came back, rather than editing the local
 * copy and assuming. Two of them make that mandatory — a toggle changes a banner's status,
 * and a reorder changes every row's position, neither of which the client decides.
 */
export function useBanners() {
  const [banners, setBanners] = useState<InstructorBanner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [subView, setSubView] = useState<BannersSubView>("list");
  const [editingBanner, setEditingBanner] = useState<InstructorBanner | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setBanners(await bannersService.loadBanners());
    } catch (err) {
      console.error("Failed to load banners", err);
      setError(toMessage(err, "تعذر تحميل الإعلانات"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  /** Replaces one row in place, keeping the order the server already put them in. */
  const replaceBanner = useCallback((updated: InstructorBanner) => {
    setBanners((current) => current.map((b) => (b.id === updated.id ? updated : b)));
  }, []);

  const handleToggleEnabled = useCallback(
    async (banner: InstructorBanner) => {
      setPendingId(banner.id);
      setError(null);
      try {
        replaceBanner(await bannersService.toggleBanner(banner));
      } catch (err) {
        console.error("Failed to toggle banner", err);
        setError(toMessage(err, "تعذر تحديث حالة الإعلان"));
      } finally {
        setPendingId(null);
      }
    },
    [replaceBanner],
  );

  const handleDuplicate = useCallback(async (banner: InstructorBanner) => {
    setPendingId(banner.id);
    setError(null);
    try {
      const copy = await bannersService.duplicateBanner(banner);
      // The copy was appended server-side; putting it at the head is where the owner is
      // looking, and the next load re-reads the real order anyway.
      setBanners((current) => [copy, ...current]);
    } catch (err) {
      console.error("Failed to duplicate banner", err);
      setError(toMessage(err, "تعذر نسخ الإعلان"));
    } finally {
      setPendingId(null);
    }
  }, []);

  const handleDelete = useCallback(async (bannerId: number) => {
    setPendingId(bannerId);
    setError(null);
    try {
      await bannersService.deleteBanner(bannerId);
      setBanners((current) => current.filter((b) => b.id !== bannerId));
      setDeleteId(null);
    } catch (err) {
      console.error("Failed to delete banner", err);
      setError(toMessage(err, "تعذر حذف الإعلان"));
    } finally {
      setPendingId(null);
    }
  }, []);

  /**
   * The dragged order is shown immediately and then confirmed. A drag that the server
   * refuses is rolled back to what it had, rather than left looking as though it worked.
   */
  const handleReorder = useCallback(
    async (reordered: InstructorBanner[]) => {
      const previous = banners;
      setBanners(reordered);
      setError(null);
      try {
        setBanners(await bannersService.reorderBanners(reordered.map((b) => b.id)));
      } catch (err) {
        console.error("Failed to reorder banners", err);
        setBanners(previous);
        setError(toMessage(err, "تعذر إعادة ترتيب الإعلانات"));
      }
    },
    [banners],
  );

  const openCreate = useCallback(() => {
    setEditingBanner(null);
    setSubView("create");
  }, []);

  const openEdit = useCallback((banner: InstructorBanner) => {
    setEditingBanner(banner);
    setSubView("edit");
  }, []);

  const closeEditor = useCallback(() => {
    setEditingBanner(null);
    setSubView("list");
  }, []);

  /** A save lands the editor back on a list that already reflects it. */
  const handleSaved = useCallback(() => {
    setEditingBanner(null);
    setSubView("list");
    void load();
  }, [load]);

  const activeCount = banners.filter((b) => b.status === "ACTIVE").length;
  const bannerToDelete = banners.find((b) => b.id === deleteId) ?? null;

  return {
    banners,
    isLoading,
    error,
    pendingId,
    deleteId,
    bannerToDelete,
    activeCount,
    subView,
    editingBanner,
    onRequestDelete: setDeleteId,
    onCancelDelete: () => setDeleteId(null),
    onConfirmDelete: handleDelete,
    onToggleEnabled: handleToggleEnabled,
    onDuplicate: handleDuplicate,
    onReorder: handleReorder,
    onCreateBanner: openCreate,
    onEditBanner: openEdit,
    onCancelEditor: closeEditor,
    onSaved: handleSaved,
    onRetry: load,
  };
}

function toMessage(err: unknown, fallback: string): string {
  return err instanceof ApiError ? (err.errors[0] ?? fallback) : fallback;
}

export type UseBannersReturn = ReturnType<typeof useBanners>;
