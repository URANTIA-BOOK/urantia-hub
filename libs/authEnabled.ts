/**
 * Login is opt-in. Local and staging feel like a reader unless AUTH_ENABLED
 * (or NEXT_PUBLIC_AUTH_ENABLED) is exactly "1" or "true".
 */
export const AUTH_OFF_READ_HREF = "/api/redirect/user/read";

export function isAuthEnabled(
  env: NodeJS.ProcessEnv = process.env
): boolean {
  const value = env.NEXT_PUBLIC_AUTH_ENABLED ?? env.AUTH_ENABLED;
  return value === "1" || value === "true";
}

export type AuthOffNextAuthKind = "session" | "csrf" | "providers" | "redirect";

/**
 * SessionProvider always probes session/csrf/providers. Those must stay JSON
 * when login is off so a 307 does not dump the reader onto /auth/error.
 */
export function authOffNextAuthKind(action: string): AuthOffNextAuthKind {
  if (action === "session") return "session";
  if (action === "csrf") return "csrf";
  if (action === "providers") return "providers";
  return "redirect";
}

export function nextAuthAction(
  nextauth: string | string[] | undefined
): string {
  if (Array.isArray(nextauth)) return nextauth[0] ?? "";
  return typeof nextauth === "string" ? nextauth : "";
}
