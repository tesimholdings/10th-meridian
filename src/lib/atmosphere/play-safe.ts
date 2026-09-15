/** Play/pause without surfacing AbortError when IO and autoplay race. */

export function playSafe(video: HTMLVideoElement | null | undefined): Promise<void> {
  if (!video) return Promise.resolve();
  const p = video.play();
  if (!p) return Promise.resolve();
  return p.catch((err: unknown) => {
    if (err instanceof DOMException && err.name === "AbortError") return;
  });
}

export function pauseSafe(
  video: HTMLVideoElement | null | undefined,
  pending: Promise<void> | null,
): void {
  if (!video) return;
  if (pending) {
    void pending.then(() => {
      if (!video.paused) video.pause();
    });
    return;
  }
  video.pause();
}
