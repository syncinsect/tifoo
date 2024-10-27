import { useState, useCallback } from "react";

export const useFloatingWindowLogic = (
  classes: string[],
  element: HTMLElement
) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleCopyClasses = useCallback(() => {
    const classesString = classes.join(" ");
    navigator.clipboard
      .writeText(classesString)
      .then(() => {
        setToastMessage("Classes copied to clipboard!");
      })
      .catch(() => setToastMessage("Failed to copy classes"));
  }, [classes]);

  const handleCopyElement = useCallback(() => {
    const elementString = element.outerHTML;
    navigator.clipboard
      .writeText(elementString)
      .then(() => {
        setToastMessage("Element copied to clipboard!");
      })
      .catch(() => setToastMessage("Failed to copy element"));
  }, [element]);

  return {
    toastMessage,
    setToastMessage,
    handleCopyClasses,
    handleCopyElement,
  };
};
