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

export function searchTailwindClasses(
  prefix: string,
  limit: number = 10
): [string, string][] {
  const results: [string, string][] = []
  for (const [className, properties] of tailwindClasses) {
    if (className.startsWith(prefix)) {
      results.push([className, properties])
      if (results.length >= limit) break
    }
  }
  return results
}
