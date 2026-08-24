import { BannersList } from "../components/banners-list";
import { useBanners } from "../hooks/use-banners";

interface BannersPageProps {
  onCreateBanner: () => void;
  onEditBanner: (bannerId: number) => void;
}

/**
 * The instructor's banner list.
 *
 * The editor used to be a sub-view this screen swapped itself for. It is now a route of
 * its own, so this page is only ever the list — which is what lets a half-written banner
 * survive a refresh and lets "back" mean the list rather than an undo.
 */
export function BannersPage({ onCreateBanner, onEditBanner }: BannersPageProps) {
  const view = useBanners();

  return (
    <BannersList
      banners={view.banners}
      isLoading={view.isLoading}
      error={view.error}
      pendingId={view.pendingId}
      bannerToDelete={view.bannerToDelete}
      activeCount={view.activeCount}
      onCreateBanner={onCreateBanner}
      onEditBanner={(banner) => onEditBanner(banner.id)}
      onDuplicate={view.onDuplicate}
      onToggleEnabled={view.onToggleEnabled}
      onRequestDelete={view.onRequestDelete}
      onCancelDelete={view.onCancelDelete}
      onConfirmDelete={view.onConfirmDelete}
      onReorder={view.onReorder}
      onRetry={view.onRetry}
    />
  );
}
