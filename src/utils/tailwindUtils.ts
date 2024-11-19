import type { StyleGroups, TailwindClassData } from "@/types";

import tailwindClassesData from "../../assets/tailwind-classes.json";

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
    // skip empty class names
    if (!cls) return false;

    const parts = cls.split(":");
    const baseClass = parts[parts.length - 1];

    // check if it is a known Tailwind class
    if (tailwindClasses.some(({ c }) => c === baseClass)) {
      return true;
    }

    // check prefixed classes
    if (parts.length > 1) {
      const prefix = parts[0];
      const restOfClass = parts.slice(1).join(":");
      if (
        allPrefixes.includes(prefix) &&
        tailwindClasses.some(({ c }) => c === restOfClass)
      ) {
        return true;
      }
    }

    // check if it matches the Tailwind class name pattern
    const tailwindPattern = /^[a-z0-9-]+(?:-[a-z0-9-]+)*$/;
    return tailwindPattern.test(cls);
  });
};

export const searchTailwindClasses = (query: string): TailwindClassData => {
  if (!query.trim()) return [];

  const isValidPrefixStart = allPrefixes.some((prefix) =>
    query.toLowerCase().startsWith(`${prefix}:`)
  );

  const parts = query.toLowerCase().split(":");

  if (parts.length > 1 && !isValidPrefixStart) {
    return [];
  }

  const prefix = parts.length > 1 ? parts[0] : "";
  const searchText = parts[parts.length - 1];
  const keywords = searchText.split(/\s+/);

  const weightedResults = tailwindClasses.map((classData) => {
    const className = classData.c.toLowerCase();
    const propertyName = classData.p.toLowerCase();
    let weight = 0;

    for (const keyword of keywords) {
      if (!keyword) continue;

      // Class name and property exact match
      if (className === keyword || propertyName === keyword) {
        weight += 100;
        continue;
      }

      // Class name or property starts with keyword
      if (className.startsWith(keyword) || propertyName.startsWith(keyword)) {
        weight += 50;
        continue;
      }

      // Keyword appears after a dash in class name or property
      if (
        className.includes(`-${keyword}`) ||
        propertyName.includes(`-${keyword}`)
      ) {
        weight += 30;
        continue;
      }

      // Keyword appears anywhere in class name or property
      if (className.includes(keyword) || propertyName.includes(keyword)) {
        weight += 10;
        continue;
      }

      weight = -1;
      break;
    }

    return {
      classData: {
        ...classData,
        c: prefix ? `${prefix}:${classData.c}` : classData.c,
      },
      weight,
    };
  });

  return weightedResults
    .filter((result) => result.weight > 0)
    .sort((a, b) => b.weight - a.weight)
    .map((result) => result.classData);
};

export const applyTailwindStyle = (
  element: HTMLElement,
  className: string
): void => {
  // only initialize once
  initialize(element);

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

let styleGroups: StyleGroups = {
  base: new Set(),
  sm: new Set(),
  md: new Set(),
  lg: new Set(),
  xl: new Set(),
  "2xl": new Set(),
};

let initialized = false;

// init function
const initialize = (element: HTMLElement): void => {
  if (initialized) return;

  getAllComputedMediaQueries(element);
  initialized = true;
};

// get all computed media queries
const getAllComputedMediaQueries = (element: HTMLElement): void => {
  const styles = document.styleSheets;

  for (const sheet of styles) {
    try {
      const rules = sheet.cssRules || sheet.rules;
      for (const rule of rules) {
        if (rule instanceof CSSMediaRule) {
          const mediaText = rule.conditionText || rule.media.mediaText;
          const prefix = mediaQueryPrefixes.find(
            (p) => mediaText === getMediaQuery(p)
          );

          if (prefix) {
            for (const styleRule of rule.cssRules) {
              if (
                styleRule instanceof CSSStyleRule &&
                element.matches(styleRule.selectorText)
              ) {
                // check if the selector already contains the media query prefix
                const selectorHasPrefix = styleRule.selectorText.includes(
                  `\\:${prefix}\\:`
                );
                if (!selectorHasPrefix) {
                  // only add the original style without prefix
                  styleGroups[prefix as keyof StyleGroups].add(
                    `@media ${mediaText} { ${styleRule.cssText} }`
                  );
                }
              }
            }
          }
        }
      }
    } catch (e) {
      // cross-origin style sheets will throw an error, ignore
      continue;
    }
  }
};

const extractBaseStyle = (mediaQueryStyle: string): string | null => {
  // extract selector and style from media query
  const matches = mediaQueryStyle.match(/@media[^{]+{([^}]+)}/);
  if (matches) {
    const innerContent = matches[1];
    const selectorAndStyle = innerContent.match(/(\.[^{]+){([^}]+)}/);
    if (selectorAndStyle) {
      const [, selector, styles] = selectorAndStyle;
      return `${selector.trim()}{${styles.trim()}}`;
    }
  }
  return null;
};

const injectStyle = (styleContent: string): void => {
  let styleElement = document.getElementById("tifoo-injected-styles");
  if (!styleElement) {
    styleElement = document.createElement("style");
    styleElement.id = "tifoo-injected-styles";
    document.head.appendChild(styleElement);
  }

  // generate unique identifier for style content
  const styleKey = styleContent.replace(/\s+/g, "");

  // check if it is a media query style
  if (styleContent.includes("@media")) {
    const prefix = mediaQueryPrefixes.find((p) =>
      styleContent.includes(`@media ${getMediaQuery(p)}`)
    );
    if (prefix) {
      const mediaQueryGroup = styleGroups[prefix as keyof StyleGroups];
      // check if it already exists
      const exists = [...mediaQueryGroup].some(
        (style) => style.replace(/\s+/g, "") === styleKey
      );

      if (!exists) {
        mediaQueryGroup.add(styleContent);
      }
    }
  } else {
    // check if the base style already exists
    const exists = [...styleGroups.base].some(
      (style) => style.replace(/\s+/g, "") === styleKey
    );

    if (!exists) {
      styleGroups.base.add(styleContent);
    }
  }

  // combine all styles in priority order
  styleElement.textContent = [
    ...[...styleGroups.base],
    ...[...styleGroups.sm],
    ...[...styleGroups.md],
    ...[...styleGroups.lg],
    ...[...styleGroups.xl],
    ...[...styleGroups["2xl"]],
  ].join("\n");
};

// clear style groups
export const clearStyleGroups = (): void => {
  styleGroups = {
    base: new Set(),
    sm: new Set(),
    md: new Set(),
    lg: new Set(),
    xl: new Set(),
    "2xl": new Set(),
  };
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
