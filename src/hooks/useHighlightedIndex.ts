import { useCallback, useEffect, useState } from "react";

export const useHighlightedIndex = (optionsLength: number) => {
  const [highlightedIndex, setHighlightedIndex] = useState<number>(0);

  useEffect(() => {
    if (optionsLength > 0) {
      setHighlightedIndex(0);
    }
  }, [optionsLength]);

  const updateHighlightedIndex = useCallback(
    (delta: number) => {
      setHighlightedIndex((prevIndex) =>
        Math.max(0, Math.min(prevIndex + delta, optionsLength - 1))
      );
    },
    [optionsLength]
  );

  return { highlightedIndex, setHighlightedIndex, updateHighlightedIndex };
};
