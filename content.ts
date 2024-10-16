export {}

type ComputedStyles = {
  padding: {
    top: number
    right: number
    bottom: number
    left: number
  }
  margin: {
    top: number
    right: number
    bottom: number
    left: number
  }
}

let isActive = false
let highlightLines: HTMLElement[] = []
let highlightBox: HTMLElement | null = null
let infoElement: HTMLElement | null = null
let lastHighlightedElement: HTMLElement | null = null
let floatingWindow: HTMLElement | null = null
let isFloatingWindowFixed = false

const colors = {
  border: "rgba(59, 130, 246, 0.5)",
  padding: "rgba(147, 196, 125, 0.55)",
  margin: "rgba(246, 178, 107, 0.66)",
  content: "rgba(111, 168, 220, 0.66)"
}

function createElementWithStyles(
  tagName: string,
  styles: Partial<CSSStyleDeclaration>
): HTMLElement {
  const element = document.createElement(tagName)
  Object.assign(element.style, styles)
  return element
}

function createLine(
  position: "horizontal" | "vertical",
  offset: number
): HTMLElement {
  const commonStyles = {
    position: "fixed",
    backgroundColor: colors.border,
    zIndex: "9999",
    pointerEvents: "none"
  }

  const specificStyles =
    position === "horizontal"
      ? {
          width: "100%",
          height: "0",
          borderTop: `1px dashed ${colors.border}`,
          left: "0",
          top: `${offset}px`
        }
      : {
          height: "100%",
          width: "0",
          borderLeft: `1px dashed ${colors.border}`,
          top: "0",
          left: `${offset}px`
        }

  const line = createElementWithStyles("div", {
    ...commonStyles,
    ...specificStyles
  })
  document.body.appendChild(line)
  return line
}

function createHighlightBox(): HTMLElement {
  return createElementWithStyles("div", {
    position: "absolute",
    pointerEvents: "none",
    zIndex: "9998"
  })
}

function createInfoElement(): HTMLElement {
  const info = createElementWithStyles("div", {
    position: "fixed",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    color: "white",
    padding: "5px",
    borderRadius: "3px",
    fontSize: "12px",
    zIndex: "10000"
  })
  document.body.appendChild(info)
  return info
}

function getElementStyles(element: HTMLElement) {
  const styles = window.getComputedStyle(element)
  const getIntValue = (prop: string) => parseInt(styles.getPropertyValue(prop))
  return {
    padding: {
      top: getIntValue("padding-top"),
      right: getIntValue("padding-right"),
      bottom: getIntValue("padding-bottom"),
      left: getIntValue("padding-left")
    },
    margin: {
      top: getIntValue("margin-top"),
      right: getIntValue("margin-right"),
      bottom: getIntValue("margin-bottom"),
      left: getIntValue("margin-left")
    }
  }
}

function createBoxElement(
  styles: Partial<CSSStyleDeclaration>,
  color: string
): HTMLElement {
  return createElementWithStyles("div", {
    ...styles,
    backgroundColor: color,
    pointerEvents: "none"
  })
}

function addMarginHighlight(outerBox: HTMLElement, styles: ComputedStyles) {
  const marginBox = createBoxElement(
    {
      position: "absolute",
      left: `-${styles.margin.left}px`,
      top: `-${styles.margin.top}px`,
      right: `-${styles.margin.right}px`,
      bottom: `-${styles.margin.bottom}px`,
      pointerEvents: "none"
    },
    colors.margin
  )

  const innerBox = createBoxElement(
    {
      position: "absolute",
      left: `${styles.margin.left}px`,
      top: `${styles.margin.top}px`,
      right: `${styles.margin.right}px`,
      bottom: `${styles.margin.bottom}px`,
      backgroundColor: "transparent",
      border: `2px solid ${colors.border}` // 使用原来定义的 border 颜色
    },
    "transparent"
  )

  marginBox.appendChild(innerBox)
  outerBox.appendChild(marginBox)

  // add labels
  const directions = ["left", "right", "top", "bottom"] as const
  directions.forEach((direction) => {
    if (styles.margin[direction] > 0) {
      const label = createMarginLabel(styles.margin[direction], direction)
      marginBox.appendChild(label)
    }
  })
}

function createMarginLabel(value: number, direction: string): HTMLElement {
  const label = document.createElement("div")
  label.textContent = `${value}px`
  label.style.position = "absolute"
  label.style.color = "white"
  label.style.fontSize = "10px"
  label.style.backgroundColor = "rgba(0,0,0,0.5)"
  label.style.padding = "2px 4px"
  label.style.borderRadius = "2px"

  switch (direction) {
    case "top":
      label.style.top = "0"
      label.style.left = "50%"
      label.style.transform = "translate(-50%, -50%)"
      break
    case "bottom":
      label.style.bottom = "0"
      label.style.left = "50%"
      label.style.transform = "translate(-50%, 50%)"
      break
    case "left":
      label.style.left = "0"
      label.style.top = "50%"
      label.style.transform = "translate(-50%, -50%)"
      break
    case "right":
      label.style.right = "0"
      label.style.top = "50%"
      label.style.transform = "translate(50%, -50%)"
      break
  }

  return label
}

function updateHighlight(element: HTMLElement) {
  removeHighlight()

  const rect = element.getBoundingClientRect()
  const styles = getElementStyles(element)

  // calculate viewport size
  const viewportWidth =
    window.innerWidth || document.documentElement.clientWidth
  const viewportHeight =
    window.innerHeight || document.documentElement.clientHeight

  // create highlight box
  highlightBox = createHighlightBox()

  // ensure highlight box not out of viewport
  const left = Math.max(
    0,
    Math.min(rect.left + window.scrollX, viewportWidth - rect.width)
  )
  const top = Math.max(
    0,
    Math.min(rect.top + window.scrollY, viewportHeight - rect.height)
  )

  highlightBox.style.left = `${left}px`
  highlightBox.style.top = `${top}px`
  highlightBox.style.width = `${Math.min(rect.width, viewportWidth - left)}px`
  highlightBox.style.height = `${Math.min(rect.height, viewportHeight - top)}px`

  // add margin highlight
  addMarginHighlight(highlightBox, styles)

  // add padding highlight
  const paddingBox = createBoxElement(
    {
      position: "absolute",
      left: "0",
      top: "0",
      right: "0",
      bottom: "0"
    },
    colors.padding
  )
  highlightBox.appendChild(paddingBox)

  // add content highlight
  const contentBox = createBoxElement(
    {
      position: "absolute",
      left: `${styles.padding.left}px`,
      top: `${styles.padding.top}px`,
      right: `${styles.padding.right}px`,
      bottom: `${styles.padding.bottom}px`
    },
    colors.content
  )
  highlightBox.appendChild(contentBox)

  // add border
  highlightBox.style.border = `2px solid ${colors.border}`

  document.body.appendChild(highlightBox)

  // update info element
  if (!infoElement) {
    infoElement = createInfoElement()
  }
  infoElement.textContent = `${Math.round(rect.width)}x${Math.round(rect.height)}`
  infoElement.style.left = `${left}px`
  infoElement.style.top = `${Math.max(0, top - 20)}px`

  // create lines
  highlightLines = [
    createLine("horizontal", top),
    createLine("horizontal", Math.min(top + rect.height, viewportHeight)),
    createLine("vertical", left),
    createLine("vertical", Math.min(left + rect.width, viewportWidth))
  ]
}

function removeHighlight() {
  highlightLines.forEach((line) => line.remove())
  highlightLines = []
  if (highlightBox) {
    highlightBox.remove()
    highlightBox = null
  }
  if (infoElement) {
    infoElement.remove()
    infoElement = null
  }
}

// Function to identify Tailwind classes
function identifyTailwindClasses(element: HTMLElement): string[] {
  const allClasses = element.className.split(/\s+/)
  // This is a basic regex pattern for Tailwind classes. It may need refinement.
  const tailwindPattern =
    /^(bg-|text-|p-|m-|flex|grid|border|rounded|shadow|hover:|focus:|sm:|md:|lg:|xl:).+/
  return allClasses.filter((cls) => tailwindPattern.test(cls))
}

function createFloatingWindow(element: HTMLElement): HTMLElement {
  console.log("Creating new floating window")

  if (floatingWindow) {
    floatingWindow.remove()
  }

  const window = createElementWithStyles("div", {
    position: "fixed",
    pointerEvents: "none",
    zIndex: "10001",
    backgroundColor: "rgb(17, 24, 39)",
    border: "2px solid rgb(55, 65, 81)",
    borderRadius: "8px",
    padding: "12px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    width: "280px",
    fontFamily: "Arial, sans-serif"
  })

  const title = createElementWithStyles("div", {
    color: "rgb(209, 213, 219)",
    fontSize: "14px",
    fontWeight: "600",
    marginBottom: "8px"
  })
  title.textContent = "Element Info"
  window.appendChild(title)

  // Tailwind classes display
  const tagsContainer = createElementWithStyles("div", {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px"
  })

  const tailwindClasses = identifyTailwindClasses(element)
  tailwindClasses.forEach((cls) => {
    const tagElement = createElementWithStyles("div", {
      backgroundColor: "rgb(31, 41, 55)",
      color: "rgb(209, 213, 219)",
      padding: "4px 8px",
      borderRadius: "4px",
      fontSize: "12px",
      cursor: "pointer"
    })
    tagElement.textContent = cls
    tagsContainer.appendChild(tagElement)
  })

  window.appendChild(tagsContainer)

  // Input field
  const input = createElementWithStyles("input", {
    backgroundColor: "rgb(31, 41, 55)",
    border: "none",
    borderRadius: "4px",
    color: "rgb(209, 213, 219)",
    padding: "6px",
    marginTop: "8px",
    width: "100%",
    fontSize: "12px"
  }) as HTMLInputElement
  input.placeholder = "Add classes"
  window.appendChild(input)

  document.body.appendChild(window)
  console.log("New floating window created and added to body")
  return window
}

function updateFloatingWindowPosition(e: MouseEvent) {
  if (!floatingWindow || isFloatingWindowFixed) return
  floatingWindow.style.left = `${e.clientX + 10}px`
  floatingWindow.style.top = `${e.clientY + 10}px`
}

function fixFloatingWindow(e: MouseEvent) {
  if (!isActive || !floatingWindow) return
  e.preventDefault()
  e.stopPropagation()
  isFloatingWindowFixed = !isFloatingWindowFixed
  floatingWindow.style.pointerEvents = isFloatingWindowFixed ? "auto" : "none"
}

function disablePageClicks(e: MouseEvent) {
  if (isActive) {
    e.preventDefault()
    e.stopPropagation()
  }
}

function removeFloatingWindow() {
  if (floatingWindow) {
    floatingWindow.remove()
    floatingWindow = null
    console.log("Floating window removed") // Add log
  }
}

function handleMouseOver(e: MouseEvent) {
  if (!isActive) return
  const target = e.target as HTMLElement
  lastHighlightedElement = target
  updateHighlight(target)

  // Update floating window with Tailwind classes of the hovered element
  if (floatingWindow) {
    floatingWindow.remove()
  }
  floatingWindow = createFloatingWindow(target)
}

function handleMouseOut() {
  if (!isActive) return
  removeHighlight()
  if (floatingWindow) {
    floatingWindow.remove()
    floatingWindow = null
  }
}

function handleScroll() {
  if (lastHighlightedElement) {
    updateHighlight(lastHighlightedElement)
    if (floatingWindow) {
      floatingWindow.remove()
      floatingWindow = createFloatingWindow(lastHighlightedElement)
    }
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggleScanner") {
    isActive = request.isActive
    if (isActive) {
      document.addEventListener("mouseover", handleMouseOver)
      document.addEventListener("mouseout", handleMouseOut)
      window.addEventListener("scroll", handleScroll)
      document.addEventListener("mousemove", updateFloatingWindowPosition)
      document.addEventListener("click", fixFloatingWindow, true)
      document.addEventListener("click", disablePageClicks, true)

      removeFloatingWindow() // Ensure removal of old floating window
      // Don't create a new floating window here, it will be created on mouse hover
    } else {
      document.removeEventListener("mouseover", handleMouseOver)
      document.removeEventListener("mouseout", handleMouseOut)
      window.removeEventListener("scroll", handleScroll)
      document.removeEventListener("mousemove", updateFloatingWindowPosition)
      document.removeEventListener("click", fixFloatingWindow, true)
      document.removeEventListener("click", disablePageClicks, true)
      removeHighlight()
      lastHighlightedElement = null

      removeFloatingWindow()
    }
  }
})
