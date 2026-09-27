import { Navigate, Outlet, type RouteObject } from "react-router";
import { ProfileView } from "@/features/profile/pages/profile-view";
import { useAuth } from "@/shared/auth";
import { isInstructorRole } from "@/shared/auth/roles";
import type { RouteHandle } from "@/shared/navigation/route-meta";
import { paths } from "@/shared/navigation/paths";
import { AccountOverviewPage } from "./account/pages/account-overview-page";
import { NameEditorPage } from "./account/pages/name-editor-page";
import { EmailEditorPage } from "./account/pages/email-editor-page";
import { PasswordEditorPage } from "./account/pages/password-editor-page";
import { InvoicesPage, SubscriptionsPage } from "./billing/pages/billing-pages";
import { PaymentMethodsPendingPage } from "./billing/pages/billing-pending-pages";
import { SettingsPage } from "./pages/settings-page";

/** Typed so a misspelt key is a compile error, as in the app route table. */
const handle = (meta: RouteHandle): RouteHandle => meta;

const SETTINGS_HANDLE = handle({
  title: "الإعدادات",
  subtitle: "حسابك وأمانه، وفوترتك ومدفوعاتك",
  section: "settings",
  contentWidth: 1000,
});

/** `/profile`: the instructor's profile; a student is sent on to Settings, which replaced it. */
function ProfileRoute() {
  const { user } = useAuth();
  if (isInstructorRole(user?.role)) return <ProfileView />;
  return <Navigate to={paths.settings.account} replace />;
}

/** `/settings/*` belongs to learners; an instructor keeps the profile screen. */
function SettingsGate() {
  const { user } = useAuth();
  if (isInstructorRole(user?.role)) return <Navigate to={paths.profile} replace />;
  return <Outlet />;
}

/**
 * Both routes, for the signed-in shell. Kept here rather than inline in the app's route table so
 * the redirects and the section addresses can be exercised on their own.
 */
export const accountRoutes: RouteObject[] = [
  {
    path: "profile",
    Component: ProfileRoute,
    handle: handle({ title: "ملفي الشخصي", subtitle: "إدارة حسابك بسهولة", section: "profile" }),
  },
  {
    path: "settings",
    Component: SettingsGate,
    handle: SETTINGS_HANDLE,
    children: [
      {
        Component: SettingsPage,
        children: [
          { index: true, element: <Navigate to={paths.settings.account} replace /> },
          { path: "account", Component: AccountOverviewPage },
          { path: "account/name", Component: NameEditorPage },
          { path: "account/password", Component: PasswordEditorPage },
          { path: "account/email", Component: EmailEditorPage },
          { path: "billing", element: <Navigate to={paths.settings.subscriptions} replace /> },
          { path: "billing/subscriptions", Component: SubscriptionsPage },
          { path: "billing/payment-methods", Component: PaymentMethodsPendingPage },
          { path: "billing/invoices", Component: InvoicesPage },
          { path: "*", element: <Navigate to={paths.settings.account} replace /> },
        ],
      },
    ],
  },
];
