const PLAYING_CLASS = 'fi-play';

export function playIconAnimation(element: Element): void {
  if (typeof element.getAnimations !== 'function') return;
  if (element.classList.contains(PLAYING_CLASS)) return;

  element.classList.add(PLAYING_CLASS);
  const running = element.getAnimations({ subtree: true }).map((animation) => animation.finished);
  void Promise.allSettled(running).then(() => element.classList.remove(PLAYING_CLASS));
}
