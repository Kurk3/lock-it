export async function openItems(apps) {
  if (!window.lockIt) return;
  for (const a of apps) {
    try {
      if (a.type === "folder") {
        await window.lockIt.openFolder(a.path);
      } else {
        await window.lockIt.openApp(a.path);
      }
    } catch (e) {
      console.warn(`Failed to open ${a.name}:`, e);
    }
  }
}
