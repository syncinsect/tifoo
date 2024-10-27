import { useState, useCallback, RefObject } from "react";

export const useDraggable = (
  isFixed: boolean,
  headerRef: RefObject<HTMLDivElement>,
  floatingWindowRef: RefObject<HTMLDivElement>,
  position: { x: number; y: number },
  setPosition: (position: { x: number; y: number }) => void
) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      if (isFixed && headerRef.current?.contains(e.target as Node)) {
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
      }
    },
    [isFixed, headerRef]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging && floatingWindowRef.current) {
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;

        const windowRect = floatingWindowRef.current.getBoundingClientRect();
        const safetyMargin = 20;
        const maxX = window.innerWidth - windowRect.width - safetyMargin;

        const newX = Math.max(0, Math.min(position.x + deltaX, maxX));
        const newY = position.y + deltaY;

        setPosition({ x: newX, y: newY });
        setDragStart({ x: e.clientX, y: e.clientY });
      }
    },
    [isDragging, dragStart, position, setPosition, floatingWindowRef]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  return {
    isDragging,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
};
