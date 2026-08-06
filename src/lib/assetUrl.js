export function assetUrl(path) {
  if (!path || /^https?:\/\//i.test(path)) return path;
  const base = import.meta.env.BASE_URL || "./";
  return `${base}${String(path).replace(/^\//, "")}`;
}
