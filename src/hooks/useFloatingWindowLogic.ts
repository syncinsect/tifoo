import { useState, useCallback } from "react";
import { ClassItem, ToastProps } from "@/types";

export const useFloatingWindowLogic = (
  classes: ClassItem[],
  element: HTMLElement
) => {
  const [toast, setToast] = useState<ToastProps | null>(null);

  const handleCopyClasses = () => {
    const activeClasses = classes
      .filter((cls) => cls.active)
      .map((cls) => cls.name);

    if (activeClasses.length === 0) {
      setToast({
        message: "No classes to copy",
        type: "warning",
        onClose: () => setToast(null),
      });
      return;
    }

    const classString = activeClasses.join(" ");

    navigator.clipboard
      .writeText(classString)
      .then(() => {
        setToast({
          message: "Classes copied to clipboard!",
          type: "success",
          onClose: () => setToast(null),
        });
      })
      .catch(() => {
        setToast({
          message: "Failed to copy classes",
          type: "error",
          onClose: () => setToast(null),
        });
      });
  };

  const handleCopyElement = useCallback(() => {
    const elementString = element.outerHTML;
    navigator.clipboard
      .writeText(elementString)
      .then(() => {
        setToast({
          message: "Element copied to clipboard!",
          type: "success",
          onClose: () => setToast(null),
        });
      })
      .catch(() => {
        setToast({
          message: "Failed to copy element",
          type: "error",
          onClose: () => setToast(null),
        });
      });
  }, [element]);

  return {
    toast,
    setToast,
    handleCopyClasses,
    handleCopyElement,
  };
};
