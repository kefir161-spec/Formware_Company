export function canCreateWebGL() {
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: false }) ||
      canvas.getContext("webgl", { failIfMajorPerformanceCaveat: false }) ||
      canvas.getContext("experimental-webgl");
    if (!gl) return false;
    const lose = gl.getExtension("WEBGL_lose_context");
    lose?.loseContext();
    return true;
  } catch {
    return false;
  }
}

export function isMobileDevice() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 820px)").matches || navigator.maxTouchPoints > 1;
}

export function cappedPixelRatio(max = 1.75) {
  return Math.min(window.devicePixelRatio || 1, max);
}

export function disposeObject3D(root) {
  if (!root) return;
  root.traverse((item) => {
    if (item.geometry) item.geometry.dispose();
    if (item.material) {
      const mats = Array.isArray(item.material) ? item.material : [item.material];
      mats.forEach((mat) => {
        Object.values(mat).forEach((value) => {
          if (value && typeof value === "object" && "isTexture" in value && value.dispose) {
            value.dispose();
          }
        });
        mat.dispose?.();
      });
    }
  });
}

export function createSafeRenderer(THREE, { antialias = true, alpha = true } = {}) {
  if (!canCreateWebGL()) {
    throw new Error("WebGL unavailable");
  }
  const renderer = new THREE.WebGLRenderer({
    antialias,
    alpha,
    powerPreference: "high-performance",
    failIfMajorPerformanceCaveat: false,
  });
  renderer.setPixelRatio(cappedPixelRatio(isMobileDevice() ? 1.25 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  return renderer;
}
