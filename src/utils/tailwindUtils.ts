// src/utils/tailwindUtils.ts
import tailwindClassesData from "../../tailwind-classes.json"

type TailwindClassData = [string, string][]

const tailwindClasses: TailwindClassData =
  tailwindClassesData as TailwindClassData

export function identifyTailwindClasses(element: HTMLElement): string[] {
  if (element.classList && element.classList.length) {
    return Array.from(element.classList).filter((cls) =>
      tailwindClasses.some(([className]) => className === cls)
    )
  } else if (element.className && typeof element.className === "string") {
    return element.className
      .split(/\s+/)
      .filter((cls) => tailwindClasses.some(([className]) => className === cls))
  }
  return []
}

export function searchTailwindClasses(prefix: string): [string, string][] {
  const results: [string, string][] = []
  for (const [className, properties] of tailwindClasses) {
    if (className.startsWith(prefix)) {
      results.push([className, properties])
    }
  }
  return results
}

export function applyTailwindStyle(
  element: HTMLElement,
  className: string
): void {
  const classData = tailwindClasses.find(([cls]) => cls === className)
  if (classData) {
    const [, properties] = classData
    const styleProperties = properties.split(";").map((prop) => prop.trim())
    for (const property of styleProperties) {
      const [key, value] = property.split(":").map((part) => part.trim())
      element.style.setProperty(key, value)
    }
  }
}

export function removeTailwindStyle(
  element: HTMLElement,
  className: string
): void {
  const classData = tailwindClasses.find(([cls]) => cls === className)
  if (classData) {
    const [, properties] = classData
    const styleProperties = properties.split(";").map((prop) => prop.trim())
    for (const property of styleProperties) {
      const [key] = property.split(":").map((part) => part.trim())
      element.style.removeProperty(key)
    }
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
