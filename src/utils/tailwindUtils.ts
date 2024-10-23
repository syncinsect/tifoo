import type { TailwindClassData } from "@/types"

import tailwindClassesData from "../../tailwind-classes.json"

const tailwindClasses: TailwindClassData =
  tailwindClassesData as TailwindClassData

let injectedStyles: Set<string> = new Set()

export function identifyTailwindClasses(element: HTMLElement): string[] {
  const classNames = element.classList
    ? Array.from(element.classList)
    : element.className.split(/\s+/)

  return classNames.filter((cls) => {
    if (tailwindClasses.some(({ c }) => c === cls)) {
      return true
    }

    const parts = cls.split(":")
    if (parts.length > 1) {
      const prefix = parts[0]
      const restOfClass = parts.slice(1).join(":")
      if (
        ["sm", "md", "lg", "xl", "2xl"].includes(prefix) &&
        tailwindClasses.some(({ c }) => c === restOfClass)
      ) {
        return true
      }
    }

    return false
  })
}

export function searchTailwindClasses(prefix: string): TailwindClassData {
  return tailwindClasses.filter(({ c }) => c.startsWith(prefix))
}

export function applyTailwindStyle(
  element: HTMLElement,
  className: string
): void {
  if (!element.classList.contains(className)) {
    element.classList.add(className)
    injectTailwindClass(className)
    refreshTailwind()
  }
}

function injectTailwindClass(className: string): void {
  if (injectedStyles.has(className)) return

  const classData = tailwindClasses.find(({ c }) => c === className)
  if (classData) {
    let styleElement = document.getElementById("tailware-injected-styles")
    if (!styleElement) {
      styleElement = document.createElement("style")
      styleElement.id = "tailware-injected-styles"
      document.head.appendChild(styleElement)
    }
    styleElement.textContent += `.${className} { ${classData.p} }\n`
    injectedStyles.add(className)
  }
}

export function removeTailwindStyle(
  element: HTMLElement,
  className: string
): void {
  if (element.classList.contains(className)) {
    element.classList.remove(className)
    refreshTailwind()
  }
}

export function refreshTailwind(): void {
  if (window.Tailwind && typeof window.Tailwind.refresh === "function") {
    window.Tailwind.refresh()
  }
}
declare global {
  interface Window {
    Tailwind?: {
      refresh: () => void
    }
  }
}
