import { useEffect } from "react";

export const useStyleInjection = (isActive: boolean) => {
  useEffect(() => {
    const styleId = "tailware-injected-styles";
    let styleElement = document.getElementById(styleId);

    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    return () => {
      const existingStyle = document.getElementById(styleId);
      if (existingStyle && !document.querySelector("[data-tw-ext]")) {
        existingStyle.remove();
      }
    };
  }, []);
};
