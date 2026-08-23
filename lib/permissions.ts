export const ROLE_PERMISSIONS: Record<string, string[]> = {
  super_admin: ["*"],
  journaliste: ["/admin/articles"],
  arbitre: ["/admin/matchs"],
};

export const ALWAYS_ALLOWED = ["/admin/login", "/admin/logout", "/admin"];

export function hasAccess(role: string, pathname: string): boolean {
  if (ALWAYS_ALLOWED.includes(pathname)) return true;

  const allowed = ROLE_PERMISSIONS[role] ?? [];
  if (allowed.includes("*")) return true;

  return allowed.some((prefix) => pathname.startsWith(prefix));
}