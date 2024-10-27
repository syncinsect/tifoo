import type { TailwindClassData } from "@/types";

import tailwindClassesData from "../../tailwind-classes.json";

const tailwindClasses: TailwindClassData =
  tailwindClassesData as TailwindClassData;

let injectedStyles: Set<string> = new Set();

const mediaQueryPrefixes = ["sm", "md", "lg", "xl", "2xl"];
const pseudoClasses = [
  "hover",
  "focus",
  "active",
  "visited",
  "first",
  "last",
  "odd",
  "even",
  "disabled",
  "checked",
  "focus-within",
  "focus-visible",
];
const pseudoElements = ["before", "after"];
const specialPrefixes = [
  "group-hover",
  "group-focus",
  "motion-safe",
  "motion-reduce",
  "dark",
];

const allPrefixes = [
  ...mediaQueryPrefixes,
  ...pseudoClasses,
  ...pseudoElements,
  ...specialPrefixes,
];

export const identifyTailwindClasses = (element: HTMLElement): string[] => {
  const classNames = element.classList
    ? Array.from(element.classList)
    : element.className.split(/\s+/);

  return classNames.filter((cls) => {
    const parts = cls.split(":");
    const baseClass = parts[parts.length - 1];

    if (tailwindClasses.some(({ c }) => c === baseClass)) {
      return true;
    }

    if (parts.length > 1) {
      const prefix = parts[0];
      const restOfClass = parts.slice(1).join(":");
      return (
        allPrefixes.includes(prefix) &&
        tailwindClasses.some(({ c }) => c === restOfClass)
      );
    }

    return false;
  });
};

export const searchTailwindClasses = (prefix: string): TailwindClassData =>
  tailwindClasses.filter(({ c }) => c.startsWith(prefix));

export const applyTailwindStyle = (
  element: HTMLElement,
  className: string
): void => {
  element.classList.add(className);
  injectTailwindClass(className);
  refreshTailwind();
};

const injectTailwindClass = (className: string): void => {
  if (injectedStyles.has(className)) return;

  const parts = className.split(":");
  let classData;

  if (parts.length > 1) {
    const prefix = parts[0];
    const restOfClass = parts.slice(1).join(":");
    classData = tailwindClasses.find(({ c }) => c === restOfClass);
    if (classData) {
      const escapedClassName = className.replace(/:/g, "\\:");
      let styleContent = "";

      switch (true) {
        case mediaQueryPrefixes.includes(prefix):
          const mediaQuery = getMediaQuery(prefix);
          styleContent = `@media ${mediaQuery} { .${escapedClassName} { ${classData.p} } }`;
          break;
        case pseudoClasses.includes(prefix):
          styleContent = `.${escapedClassName}:${prefix} { ${classData.p} }`;
          break;
        case pseudoElements.includes(prefix):
          styleContent = `.${escapedClassName}::${prefix} { ${classData.p} }`;
          break;
        case prefix === "dark":
          styleContent = `@media (prefers-color-scheme: dark) { .${escapedClassName} { ${classData.p} } }`;
          break;
        case prefix.startsWith("group"):
          const groupPrefix = prefix.replace("group-", "");
          styleContent = `.group:${groupPrefix} .${escapedClassName} { ${classData.p} }`;
          break;
        default:
          styleContent = `.${escapedClassName} { ${classData.p} }`;
      }

      injectStyle(styleContent);
    }
  } else {
    classData = tailwindClasses.find(({ c }) => c === className);
    if (classData) {
      const escapedClassName = className.replace(/:/g, "\\:");
      const styleContent = `.${escapedClassName} { ${classData.p} }`;
      injectStyle(styleContent);
    } else {
      const escapedClassName = className.replace(/:/g, "\\:");
      const styleContent = `.${escapedClassName} { ${className} }`;
      injectStyle(styleContent);
    }
  }

  if (classData) {
    injectedStyles.add(className);
  }
};

const getMediaQuery = (prefix: string): string => {
  switch (prefix) {
    case "sm":
      return "(min-width: 640px)";
    case "md":
      return "(min-width: 768px)";
    case "lg":
      return "(min-width: 1024px)";
    case "xl":
      return "(min-width: 1280px)";
    case "2xl":
      return "(min-width: 1536px)";
    default:
      return "";
  }
};

const injectStyle = (styleContent: string): void => {
  let styleElement = document.getElementById("tailware-injected-styles");
  if (!styleElement) {
    styleElement = document.createElement("style");
    styleElement.id = "tailware-injected-styles";
    document.head.appendChild(styleElement);
  }
  styleElement.textContent += styleContent + "\n";
};

export const removeTailwindStyle = (
  element: HTMLElement,
  className: string
): void => {
  if (element.classList.contains(className)) {
    element.classList.remove(className);
    refreshTailwind();
  }
};

export const refreshTailwind = (): void => {
  if (window.Tailwind && typeof window.Tailwind.refresh === "function") {
    window.Tailwind.refresh();
  }
};

declare global {
  interface Window {
    Tailwind?: {
      refresh: () => void;
    };
  }
}
