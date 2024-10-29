import { useState, useCallback } from "react";
import { ClassItem } from "@/types";

export const useFloatingWindowLogic = (
  classes: ClassItem[],
  element: HTMLElement
) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleCopyClasses = () => {
    const activeClasses = classes
      .filter((cls) => cls.active)
      .map((cls) => cls.name);

    if (activeClasses.length === 0) {
      setToastMessage("No classes to copy");
      return;
    }

    const classString = activeClasses.join(" ");

    navigator.clipboard
      .writeText(classString)
      .then(() => {
        setToastMessage("Classes copied to clipboard!");
      })
      .catch(() => {
        setToastMessage("Failed to copy classes");
      });
  };

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
