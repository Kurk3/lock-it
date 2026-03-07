let intervalId = null;
let seconds = 0;

export function start(onTick) {
  stop();
  seconds = 0;
  intervalId = setInterval(() => {
    seconds++;
    if (onTick) onTick(seconds);
  }, 1000);
}

export function stop() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  const final = seconds;
  seconds = 0;
  return final;
}

export function formatTime(totalSeconds) {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  if (hrs > 0) {
    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}
