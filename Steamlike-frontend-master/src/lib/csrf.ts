export function getCookie(name: string): string | null {
  const m = document.cookie.match(new RegExp("(^|; )" + name.replace(/([.$?*|{}()\[\]\\\/\+^])/g, "\\$1") + "=([^;]*)"));
  return m ? decodeURIComponent(m[2]) : null;
}

/**
 * Django sets "csrftoken" cookie by default.
 * If your backend uses CSRF protection (recommended), send X-CSRFToken for non-GET requests.
 */
export function csrfToken(): string | null {
  return getCookie("csrftoken");
}
