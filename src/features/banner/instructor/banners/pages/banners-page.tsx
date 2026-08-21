import { AnimatePresence, motion } from "motion/react";
import { BannersList } from "../components/banners-list";
import { useBanners } from "../hooks/use-banners";
import { BannerFormPage } from "./banner-form-page";

/**
 * The instructor's banner management screen: a list that becomes an editor and comes back.
 *
 * The editor is mounted fresh per sub-view so a create after an edit starts blank, which is
 * what the `key` on each branch is for.
 */
export function BannersPage() {
  const view = useBanners();

  return (
    <AnimatePresence mode="wait">
      {view.subView === "list" && (
        <motion.div
          key="list"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22 }}
        >
          <BannersList
            banners={view.banners}
            isLoading={view.isLoading}
            error={view.error}
            pendingId={view.pendingId}
            bannerToDelete={view.bannerToDelete}
            activeCount={view.activeCount}
            onCreateBanner={view.onCreateBanner}
            onEditBanner={view.onEditBanner}
            onDuplicate={view.onDuplicate}
            onToggleEnabled={view.onToggleEnabled}
            onRequestDelete={view.onRequestDelete}
            onCancelDelete={view.onCancelDelete}
            onConfirmDelete={view.onConfirmDelete}
            onReorder={view.onReorder}
            onRetry={view.onRetry}
          />
        </motion.div>
      )}

      {(view.subView === "create" || view.subView === "edit") && (
        <motion.div
          key="form"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22 }}
        >
          <BannerFormPage
            editingBanner={view.subView === "edit" ? view.editingBanner : null}
            onSaved={view.onSaved}
            onCancel={view.onCancelEditor}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
