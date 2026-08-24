# Manara Frontend

## Authentication

The app uses **HttpOnly cookie sessions** backed by Redis on the server. The frontend never sees or stores the session token.

### Cookies

- `MANARA_SESSION` — HttpOnly, Secure (prod), `SameSite=Lax`, 30-min rolling TTL. Not readable by JS.
- `XSRF-TOKEN` — readable by JS. Echoed back as `X-XSRF-TOKEN` on every state-changing request. Axios attaches it automatically (`xsrfCookieName` / `xsrfHeaderName` in `src/shared/api/api-client.ts`).

### Bootstrap sequence

On app load (`AuthProvider` in `src/shared/auth/auth-context.tsx`):

1. `GET /api/v1/auth/csrf` — seeds the `XSRF-TOKEN` cookie.
2. `GET /api/v1/auth/me` — hydrates user state. `200` → authenticated; `401` → anonymous.
3. Routes render. `ProtectedRoute` and `PublicOnlyRoute` (in `src/shared/auth/route-guards.tsx`) gate access based on `useAuth().status`.

### Flows

- **Login / Verify-OTP (email-verification)**: server establishes the session in the response. The hook receives `{ fullName, email, role }` and calls `setUser(...)`.
- **Logout**: `POST /api/v1/auth/logout` → server clears cookies via `Set-Cookie: Max-Age=0`. The frontend then drops local state.
- **401 on a request**: the response interceptor flips auth state to anonymous; guards redirect to `/`.
- **403 (CSRF mismatch)**: the interceptor refetches `/csrf` and retries the request once.

### Dev vs prod cookie behavior

- In **dev**, the backend issues cookies without `Secure` so `http://localhost` works. The frontend talks to `http://localhost:8081` (configurable via `VITE_API_BASE_URL`).
- In **prod**, both cookies are `Secure` (HTTPS-only). If the frontend and backend live on different origins, the backend must whitelist the frontend origin explicitly (CORS `Allow-Origin` cannot be `*` when credentials are sent).

### Do not

- Store any token in `localStorage`, `sessionStorage`, `IndexedDB`, or in-memory mirrors.
- Read `MANARA_SESSION` — it's HttpOnly by design.
- Add manual `Authorization: Bearer …` headers.
- Implement a refresh-token loop. Sessions are server-side; expired ones produce a `401` and force re-login.
