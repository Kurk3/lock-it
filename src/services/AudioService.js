let audio = null;

export async function play(url) {
  stop();
  if (!url) return;
  try {
    audio = new Audio(url);
    audio.loop = true;
    audio.volume = 0.5;
    await audio.play();
  } catch (e) {
    console.warn("Audio playback failed:", e);
  }
}

export function stop() {
  if (audio) {
    audio.pause();
    audio.src = "";
    audio = null;
  }
}
