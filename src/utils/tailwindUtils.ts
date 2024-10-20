// src/utils/tailwindUtils.ts
import tailwindClassesData from "../../tailwind-classes.json"

type TailwindClassData = {
  c: string // className
  p: string // properties
}[]

const tailwindClasses: TailwindClassData =
  tailwindClassesData as TailwindClassData

export function identifyTailwindClasses(element: HTMLElement): string[] {
  if (element.classList && element.classList.length) {
    return Array.from(element.classList).filter((cls) =>
      tailwindClasses.some(({ c }) => c === cls)
    )
  } else if (element.className && typeof element.className === "string") {
    return element.className
      .split(/\s+/)
      .filter((cls) => tailwindClasses.some(({ c }) => c === cls))
  }
  return []
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
  }
}

export function removeTailwindStyle(
  element: HTMLElement,
  className: string
): void {
  if (element.classList.contains(className)) {
    element.classList.remove(className)
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
