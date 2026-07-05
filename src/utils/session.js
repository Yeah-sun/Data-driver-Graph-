const STORAGE_KEY = "data-driver-graph-session";

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  } catch {
    return null;
  }
}

export function setSession(session) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
}

export function isAuthenticated() {
  return Boolean(getSession()?.account);
}

export function getHomePath(role = getSession()?.role) {
  return role === "admin" ? "/admin" : "/dashboard";
}
