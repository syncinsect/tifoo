import {
  applyTailwindStyle,
  identifyTailwindClasses,
  searchTailwindClasses
} from "@/utils/tailwindUtils"

describe("tailwindUtils", () => {
  test("identifyTailwindClasses correctly identifies Tailwind classes", () => {
    const element = document.createElement("div")
    element.className = "text-2xl md:text-3xl bg-blue-500"
    const classes = identifyTailwindClasses(element)
    expect(classes).toEqual(["text-2xl", "md:text-3xl", "bg-blue-500"])
  })

  test("searchTailwindClasses returns correct classes", () => {
    const result = searchTailwindClasses("text-")
    expect(result).toContainEqual({
      c: "text-2xl",
      p: "font-size: 1.5rem; line-height: 2rem;"
    })
  })

  test("applyTailwindStyle adds class and injects style", () => {
    const element = document.createElement("div")
    applyTailwindStyle(element, "text-2xl")
    expect(element.classList.contains("text-2xl")).toBeTruthy()
    const styleElement = document.getElementById("tailware-injected-styles")
    expect(styleElement?.textContent).toContain(".text-2xl")
  })
})
