export const getAdjustedPosition = (
  pos: number,
  axis: "x" | "y",
  isEnd: boolean,
  isFixed: boolean,
  elementOffset: { top: number; left: number },
  currentRect: DOMRect,
  scrollPosition: { x: number; y: number }
) => {
  let adjustedPos;
  if (isFixed) {
    adjustedPos = axis === "y" ? elementOffset.top : elementOffset.left;
    if (isEnd) {
      adjustedPos += axis === "y" ? currentRect.height : currentRect.width;
    }
  } else {
    adjustedPos = pos + (axis === "y" ? scrollPosition.y : scrollPosition.x);
  }
  return adjustedPos;
};
