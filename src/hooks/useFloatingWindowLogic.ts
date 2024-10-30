import { useState, useCallback, useEffect } from "react";
import { ClassItem, ToastProps } from "@/types";

export const useFloatingWindowLogic = (
  classes: ClassItem[],
  element: HTMLElement
) => {
  const [toast, setToast] = useState<ToastProps | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleCopyClasses = () => {
    const activeClasses = classes
      .filter((cls) => cls.active)
      .map((cls) => cls.name);

    if (activeClasses.length === 0) {
      setToast({
        message: "No classes to copy",
        type: "warning",
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
        });
      })
      .catch(() => {
        setToast({
          message: "Failed to copy classes",
          type: "error",
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
        });
      })
      .catch(() => {
        setToast({
          message: "Failed to copy element",
          type: "error",
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
