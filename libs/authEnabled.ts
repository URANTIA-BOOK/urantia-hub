/**
 * Sign-in follows the provider keys already in the environment.
 * A pair must both be non-empty. No separate auth flag.
 */
export const AUTH_OFF_READ_HREF = "/api/redirect/user/read";

function filled(value: string | undefined): boolean {
  return typeof value === "string" && value.trim() !== "";
}

export function emailAuthConfigured(
  env: NodeJS.ProcessEnv = process.env
): boolean {
  return filled(env.RESEND_API_KEY) && filled(env.EMAIL_FROM);
}

export function googleAuthConfigured(
  env: NodeJS.ProcessEnv = process.env
): boolean {
  return filled(env.GOOGLE_CLIENT_ID) && filled(env.GOOGLE_CLIENT_SECRET);
}

export function isAuthEnabled(
  env: NodeJS.ProcessEnv = process.env
): boolean {
  return emailAuthConfigured(env) || googleAuthConfigured(env);
}

export type AuthOffNextAuthKind = "session" | "csrf" | "providers" | "redirect";

/**
 * SessionProvider always probes session/csrf/providers. Those stay JSON
 * when no provider is configured so a redirect does not land on /auth/error.
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
