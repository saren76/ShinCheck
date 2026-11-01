export function getOwnerKey() {
  if (typeof window === "undefined") return "public";
  try {
    let key = window.localStorage.getItem("shincheck.owner");
    if (!key) {
      key = `own_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
      window.localStorage.setItem("shincheck.owner", key);
    }
    return key;
  } catch {
    return "public";
  }
}