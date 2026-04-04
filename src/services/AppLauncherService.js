function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

async function arrangeScreen(screen, workArea) {
  const validApps = screen.apps.filter((a) => a !== null);
  if (validApps.length === 0) return;

  // Open apps, wait for windows
  await Promise.all(
    validApps.map((app) =>
      window.lockIt.openApp(app.path || app.name).catch((e) => {
        console.warn(`Failed to open ${app.name}:`, e);
      })
    )
  );
  await Promise.all(
    validApps.map((app) =>
      window.lockIt.waitForApp(app.name, 5000).catch(() => {})
    )
  );

  // Arrange based on layout
  if (screen.layout === "fullscreen" && validApps.length >= 1) {
    try {
      await window.lockIt.arrangeApp(validApps[0].name, {
        left: workArea.x,
        top: workArea.y,
        right: workArea.x + workArea.width,
        bottom: workArea.y + workArea.height,
      });
    } catch (e) {
      console.warn("Failed to arrange maximized:", e);
    }
  } else if (screen.layout === "split" && validApps.length >= 2) {
    const half = Math.floor(workArea.width / 2);
    try {
      await window.lockIt.arrangeSplit(
        validApps[0].name,
        { left: workArea.x, top: workArea.y, right: workArea.x + half, bottom: workArea.y + workArea.height },
        validApps[1].name,
        { left: workArea.x + half, top: workArea.y, right: workArea.x + workArea.width, bottom: workArea.y + workArea.height }
      );
    } catch (e) {
      console.warn("Failed to arrange split:", e);
    }
  }
}

export async function executeDesktopLayout(screens) {
  if (!window.lockIt || !screens || screens.length === 0) return;

  let workArea;
  try {
    workArea = await window.lockIt.getWorkArea();
  } catch {
    return;
  }

  // Separate screens into regular desktops vs native fullscreen
  const desktopScreens = [];
  const nativeFullscreenScreens = [];

  for (const screen of screens) {
    const validApps = (screen.apps || []).filter((a) => a !== null);
    if (validApps.length === 0) continue;

    if (screen.layout === "fullscreen" && screen.nativeFullscreen) {
      nativeFullscreenScreens.push(screen);
    } else {
      desktopScreens.push(screen);
    }
  }

  // Quit all involved apps first for a clean slate
  const allApps = [...desktopScreens, ...nativeFullscreenScreens]
    .flatMap((s) => (s.apps || []).filter((a) => a !== null));
  const uniqueAppNames = [...new Set(allApps.map((a) => a.name))];

  await Promise.all(
    uniqueAppNames.map((name) =>
      window.lockIt.quitApp(name).catch(() => {})
    )
  );

  // Process each desktop sequentially:
  // For each screen: create a new desktop + switch to it → open apps → arrange
  for (let i = 0; i < desktopScreens.length; i++) {
    // Always create a fresh desktop and switch to it
    try {
      await window.lockIt.createAndSwitchDesktop();
    } catch (e) {
      console.warn(`Failed to create desktop ${i + 1}:`, e);
    }
    await delay(500);

    // Now we're on the new desktop — open and arrange apps here
    await arrangeScreen(desktopScreens[i], workArea);
  }

  // Native fullscreen apps last (they create their own space)
  for (const screen of nativeFullscreenScreens) {
    const app = screen.apps.find((a) => a !== null);
    if (!app) continue;

    try {
      await window.lockIt.openApp(app.path || app.name);
    } catch (e) {
      console.warn(`Failed to open ${app.name}:`, e);
    }
    await window.lockIt.waitForApp(app.name, 5000).catch(() => {});

    try {
      await window.lockIt.fullscreenApp(app.name);
    } catch (e) {
      console.warn(`Failed to fullscreen ${app.name}:`, e);
    }
    await delay(600);
  }
}

export async function closeOtherApps() {
  if (!window.lockIt?.closeOtherApps) return;
  try {
    await window.lockIt.closeOtherApps();
  } catch (e) {
    console.warn("Failed to close other apps:", e);
  }
}
