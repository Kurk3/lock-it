export async function setGrayscale(enable) {
  try {
    if (window.lockIt) await window.lockIt.toggleGrayscale(enable);
  } catch (e) {
    console.warn("Grayscale toggle failed:", e);
  }
}
