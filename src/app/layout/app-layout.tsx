import { useEffect, useRef, useState } from "react";
import { useLocation, useOutlet } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { Menu } from "lucide-react";
import { Sidebar } from "@/features/main/components/sidebar";
import { useAuth, useLogoutAction } from "@/shared/auth";
import { offscreenInlineStart, towardInlineEnd, useDirection } from "@/shared/direction";
import { useRouteMeta } from "@/shared/navigation";
import { useIsMobile } from "@/shared/responsive";

/**
 * The signed-in shell: the navigation, the page heading, and the scrolling column the
 * feature routes render into.
 *
 * The shell owns no view state beyond whether the drawer is open. Which screen is showing,
 * what the heading reads and which entry is lit are all answers to "what route is matched",
 * read from the matched routes' own metadata. That is what makes a refresh, a pasted URL
 * and a browser Back all land on exactly the same thing.
 *
 * ── On the sidebar and the drawer ──
 *
 * The sidebar is 280px and did not shrink, so below `md` it was not a sidebar, it was a
 * subtraction: at 375px it left `375 - 280 - 64px of gutters = 31px` for the page, inside
 * an `overflow: hidden` that meant the remainder could not even be scrolled to. Every
 * signed-in screen inherited that, and it is why sixteen of them measured up to 387px of
 * content outside the viewport.
 *
 * So below `md` the same navigation is presented as a drawer instead. Not a second
 * navigation — the same component, the same entries in the same order, lit by the same
 * route metadata — just somewhere it fits. Above `md` nothing about this file's output
 * has changed.
 *
 * ── On which side the navigation is on ──
 *
 * The navigation lives on the **inline-start** edge: the right in Arabic, the left in
 * English. Not "the right", and not "the right when the language is Arabic" — the side is
 * `LayoutDirection`'s answer, read once here and used for the column, the drawer, the
 * drawer's animation and the heading's alike, so those four cannot drift apart.
 *
 * The drawer had drifted. It was anchored with `inset-inline-end: 0`, which in RTL is the
 * *left*, and animated with a hard-coded `x: "100%"`, which is *rightwards* in both
 * directions because transforms are physical. So on a phone the button sat on the right and
 * the navigation flew in from mid-screen and parked on the left. The column above `md` was
 * never wrong, which is what made it look like a drawer bug rather than what it was: two
 * different answers in one shell to the question of which side navigation is on.
 */
export function AppLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const logout = useLogoutAction();
  const meta = useRouteMeta();

  /*
    The one input the whole shell's sidedness is derived from. Everything below asks this
    rather than asking whether the copy is Arabic.
  */
  const direction = useDirection();
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

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

  /* Choosing a destination is the end of using the navigation. */
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  /*
    A drawer left open across a rotation would otherwise sit over a layout that has since
    grown its own sidebar back — two copies of the same navigation, one of them modal.
  */
  useEffect(() => {
    if (!isMobile) setMenuOpen(false);
  }, [isMobile]);

  /* Escape closes it, and focus goes back to the control that opened it. */
  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  /* Opening it moves focus inside, or the next Tab lands behind the drawer. */
  useEffect(() => {
    if (menuOpen) drawerRef.current?.focus();
  }, [menuOpen]);

  const contentMaxWidth: number | string =
    meta.contentWidth === "full" ? "none" : meta.contentWidth;

  /* Where the drawer rests when shut: just past the edge it is anchored to. */
  const drawerClosedX = offscreenInlineStart(direction);

  const navigation = (
    <Sidebar
      activeSection={meta.section}
      role={user?.role}
      fullName={user?.fullName}
      onLogout={logout}
    />
  );

  return (
    <div
      /*
        The direction is put on the DOM here, not just held in React state: it is what every
        logical property below — and inside the sidebar — resolves against. A `dir` the tree
        cannot see would leave `inset-inline-start` answering to the document instead.
      */
      dir={direction}
      style={{
        display: "flex",
        /*
          `dvh`, not `vh`. `vh` is the viewport with the mobile browser's chrome
          retracted, so a `100vh` shell is taller than the screen for as long as the
          address bar is showing — which pushed the bottom of every page under it.
        */
        height: "100dvh",
        overflow: "hidden",
        fontFamily: "'Cairo', sans-serif",
        background: "#F2F3F9",
      }}
    >
      {/*
        Navigation first in the DOM, and the row is a flex container that reads in `dir`
        order — so it lands on the inline-start edge in either direction with no offset
        arithmetic and no `margin-left: 280px`. It also means a keyboard user reaches the
        navigation before the page content rather than after all of it.
      */}
      {!isMobile && navigation}

      <main className="flex-1 flex flex-col overflow-hidden" style={{ minWidth: 0 }}>
        {/* Sticky top bar */}
        <header
          className="flex-shrink-0 flex items-center"
          style={{
            height: 64,
            gap: 12,
            /* Fluid rather than a fixed 32px: `clamp` needs no media query and so works
               in an inline style, and it keeps the gutter proportional between widths
               instead of jumping at one. */
            paddingInline: "clamp(16px, 4vw, 32px)",
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
          {isMobile && (
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="فتح القائمة"
              aria-expanded={menuOpen}
              aria-haspopup="dialog"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                /* A finger-sized target, not an icon-sized one. */
                width: 44,
                height: 44,
                flexShrink: 0,
                marginInlineStart: -10,
                borderRadius: 12,
                border: "none",
                background: "transparent",
                color: "#1E2340",
              }}
            >
              <Menu size={22} />
            </button>
          )}

          {/*
            Keyed, so React replaces the heading outright and the new one plays itself in.
            It deliberately has no exit animation and no `AnimatePresence` around it: an
            exit that has to finish before the replacement may mount is one dropped
            completion callback away from freezing the heading on the previous page's
            title, which is exactly what a stale heading must never do.
          */}
          <motion.div
            key={meta.title ?? ""}
            /* Settles *towards* the inline-start edge, so the heading and the navigation
               beside it are moving in the same direction rather than opposite ones. */
            initial={{ opacity: 0, x: towardInlineEnd(direction, 10) }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-0.5"
            style={{ minWidth: 0 }}
          >
            <h1
              className="rs-longform"
              style={{ fontWeight: 700, fontSize: 18, color: "#1E2340", lineHeight: 1.2 }}
            >
              {meta.title}
            </h1>
            {meta.subtitle ? (
              <p
                className="rs-longform"
                style={{ fontSize: 12, color: "#9BA3C4" }}
              >
                {meta.subtitle}
              </p>
            ) : null}
          </motion.div>
        </header>

        {/* Scrollable content */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto"
          style={{
            backgroundImage:
              "radial-gradient(circle at 90% 5%, rgba(78,91,146,0.04) 0%, transparent 50%), radial-gradient(circle at 10% 90%, rgba(78,91,146,0.03) 0%, transparent 45%)",
          }}
        >
          {/*
            `rs-page` carries the gutters, which are fluid rather than a flat 32px — on a
            375px screen the old value spent a sixth of the width on empty margin.
          */}
          <div className="rs-page" style={{ maxWidth: contentMaxWidth, marginInline: "auto" }}>
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

      {/* ── MOBILE NAVIGATION ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {isMobile && menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMenuOpen(false)}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(10,13,40,0.45)",
                backdropFilter: "blur(2px)",
                zIndex: 40,
              }}
            />
            <motion.div
              ref={drawerRef}
              role="dialog"
              aria-modal="true"
              aria-label="القائمة"
              tabIndex={-1}
              /*
                Enters from the edge it lives on and leaves the same way — rightwards in
                Arabic, leftwards in English. A transform has no logical form, so the
                direction has to be supplied; `offscreenInlineStart` is the only place that
                sign is decided.
              */
              initial={{ x: drawerClosedX }}
              animate={{ x: 0 }}
              exit={{ x: drawerClosedX }}
              transition={{ type: "tween", duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: "fixed",
                insetBlock: 0,
                /*
                  The same edge the persistent column occupies and the same edge the button
                  that opens it sits on: the start. In RTL that is the right — which
                  `inset-inline-end` was not.
                */
                insetInlineStart: 0,
                zIndex: 41,
                /* Never wider than the screen it is covering. Sized here rather than left
                   to the sidebar's intrinsic 280px, so the cap can actually bite. */
                inlineSize: "min(280px, 88vw)",
                outline: "none",
              }}
            >
              <Sidebar
                activeSection={meta.section}
                role={user?.role}
                fullName={user?.fullName}
                onLogout={logout}
                variant="drawer"
                onNavigate={() => setMenuOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
