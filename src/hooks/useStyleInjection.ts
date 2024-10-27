import { useEffect } from "react";

export const useStyleInjection = (isActive: boolean) => {
  useEffect(() => {
    if (isActive) {
      const styleElement = document.createElement("style");
      styleElement.id = "tailware-injected-styles";
      document.head.appendChild(styleElement);
    } else {
      const styleElement = document.getElementById("tailware-injected-styles");
      if (styleElement) {
        styleElement.remove();
      }
    }
  }, [isActive]);
};
