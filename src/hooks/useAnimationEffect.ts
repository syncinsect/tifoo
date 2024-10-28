import { useEffect } from "react";

export const useAnimationEffect = (
  highlightedElement: HTMLElement | null,
  animatedRect: DOMRect | null,
  setAnimatedRect: (rect: DOMRect) => void
) => {
  useEffect(() => {
    if (highlightedElement) {
      const startRect =
        animatedRect || highlightedElement.getBoundingClientRect();
      const endRect = highlightedElement.getBoundingClientRect();

      const animate = (progress: number) => {
        const currentRect = {
          left: startRect.left + (endRect.left - startRect.left) * progress,
          top: startRect.top + (endRect.top - startRect.top) * progress,
          width: startRect.width + (endRect.width - startRect.width) * progress,
          height:
            startRect.height + (endRect.height - startRect.height) * progress,
          right: startRect.right + (endRect.right - startRect.right) * progress,
          bottom:
            startRect.bottom + (endRect.bottom - startRect.bottom) * progress,
        } as DOMRect;
        setAnimatedRect(currentRect);
      };

      const duration = 200;
      const startTime = performance.now();

      const step = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        animate(progress);
        if (progress < 1) {
          requestAnimationFrame(step);
        }
      };

      requestAnimationFrame(step);
    }
  }, [highlightedElement, animatedRect, setAnimatedRect]);
};
