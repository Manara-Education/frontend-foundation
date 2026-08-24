import { useEffect, useRef } from "react";
import { useLocation, useOutlet } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { Sidebar } from "@/features/main/components/sidebar";
import { useAuth, useLogoutAction } from "@/shared/auth";
import { useRouteMeta } from "@/shared/navigation";

/**
 * The signed-in shell: the sidebar, the page heading, and the scrolling column the feature
 * routes render into.
 *
 * The shell owns no view state. Which screen is showing, what the heading reads and which
 * sidebar entry is lit are all answers to "what route is matched", read from the matched
 * routes' own metadata. That is what makes a refresh, a pasted URL and a browser Back all
 * land on exactly the same thing.
 */
export function AppLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const logout = useLogoutAction();
  const meta = useRouteMeta();

  /*
    `useOutlet()` rather than `<Outlet />`: it hands back the element for the current
    match, so the copy AnimatePresence keeps on screen while it exits is the page being
    left rather than the page being entered.
  */
  const outlet = useOutlet();

  /*
    A new page starts at the top. The scrolling element is this column rather than the
    window, so the router's own scroll restoration does not reach it — but remounting the
    column to reset it would also tear down the exit animation, so the position is set
    directly instead.
  */
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [location.pathname]);

  const contentMaxWidth: number | string =
    meta.contentWidth === "full" ? "none" : meta.contentWidth;

  return (
    <div
      dir="ltr"
      style={{ display: "flex", height: "100vh", overflow: "hidden", fontFamily: "'Cairo', sans-serif", background: "#F2F3F9" }}
    >
      {/* ── MAIN CONTENT (Left) ───────────────────────────────────────────── */}
      <main
        className="flex-1 flex flex-col overflow-hidden"
        style={{ minWidth: 0 }}
      >
        {/* Sticky top bar */}
        <header
          className="flex-shrink-0 flex items-center px-8"
          dir="rtl"
          style={{
            height: 64,
            background: "rgba(242,243,249,0.9)",
            backdropFilter: "blur(16px)",
            borderBottomWidth: 1,
            borderBottomStyle: "solid",
            borderBottomColor: "rgba(78,91,146,0.08)",
            position: "sticky",
            top: 0,
            zIndex: 5,
          }}
        >
          {/*
            Keyed, so React replaces the heading outright and the new one plays itself in.
            It deliberately has no exit animation and no `AnimatePresence` around it: an
            exit that has to finish before the replacement may mount is one dropped
            completion callback away from freezing the heading on the previous page's
            title, which is exactly what a stale heading must never do.
          */}
            <motion.div
              key={meta.title ?? ""}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-0.5"
            >
              <h1 style={{ fontWeight: 700, fontSize: 18, color: "#1E2340", lineHeight: 1.2 }}>
                {meta.title}
              </h1>
              <p style={{ fontSize: 12, color: "#9BA3C4" }}>{meta.subtitle}</p>
            </motion.div>
        </header>

        {/* Scrollable content */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto"
          dir="rtl"
          style={{
            backgroundImage:
              "radial-gradient(circle at 90% 5%, rgba(78,91,146,0.04) 0%, transparent 50%), radial-gradient(circle at 10% 90%, rgba(78,91,146,0.03) 0%, transparent 45%)",
          }}
        >
          {/* Constrained content width — centred in the available space */}
          <div
            style={{
              maxWidth: contentMaxWidth,
              margin: "0 auto",
              padding: "28px 32px 80px",
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={meta.transitionKey}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                {outlet}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* ── SIDEBAR (Right) ───────────────────────────────────────────────── */}
      <Sidebar
        activeSection={meta.section}
        role={user?.role}
        fullName={user?.fullName}
        onLogout={logout}
      />
    </div>
  );
}
