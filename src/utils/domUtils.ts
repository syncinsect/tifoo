// src/utils/domUtils.ts
export interface ComputedStyles {
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

const colors = {
  border: "rgba(59, 130, 246, 0.5)",
  padding: "rgba(147, 196, 125, 0.55)",
  margin: "rgba(246, 178, 107, 0.66)",
  content: "rgba(111, 168, 220, 0.66)"
}

let highlightLines: HTMLElement[] = []
let highlightBox: HTMLElement | null = null
let infoElement: HTMLElement | null = null

export function getElementStyles(element: HTMLElement): ComputedStyles {
  const styles = window.getComputedStyle(element)
  const getIntValue = (prop: string) =>
    parseInt(styles.getPropertyValue(prop), 10)
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
  offset: number,
  isDashed: boolean = true
): HTMLElement {
  const line = createElementWithStyles("div", {
    position: "fixed",
    backgroundColor: "transparent",
    zIndex: "9999",
    pointerEvents: "none",
    [position === "horizontal" ? "width" : "height"]: "100%",
    [position === "horizontal" ? "height" : "width"]: "0",
    [position === "horizontal" ? "left" : "top"]: "0",
    [position === "horizontal" ? "top" : "left"]: `${offset}px`,
    borderStyle: isDashed ? "dashed" : "solid",
    borderColor: colors.border,
    borderWidth: position === "horizontal" ? "3px 0 0 0" : "0 0 0 3px",
    ...(isDashed ? { borderDasharray: "6, 4" } : {})
  })
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
    position: "absolute",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    color: "white",
    padding: "5px",
    borderRadius: "3px",
    fontSize: "12px",
    zIndex: "10000"
  })
  return info
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
      border: `2px solid ${colors.border}`
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

export function updateHighlight(
  element: HTMLElement,
  rect: DOMRect | null = null,
  useSolidLines: boolean = false
) {
  removeHighlight()

  if (!rect) {
    rect = element.getBoundingClientRect()
  }
  const styles = getElementStyles(element)

  const scrollX = window.pageXOffset || document.documentElement.scrollLeft
  const scrollY = window.pageYOffset || document.documentElement.scrollTop

  // Create Highlight Frame
  highlightBox = createHighlightBox()
  highlightBox.style.position = "fixed"
  highlightBox.style.left = `${rect.left}px`
  highlightBox.style.top = `${rect.top}px`
  highlightBox.style.width = `${rect.width}px`
  highlightBox.style.height = `${rect.height}px`

  // Add margin highlight
  addMarginHighlight(highlightBox, styles)

  // Add padding highlight
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

  // Add content highlight
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

  // Add border
  highlightBox.style.border = `2px solid ${colors.border}`

  document.body.appendChild(highlightBox)

  // Create lines
  updateOrCreateLines(rect, useSolidLines)

  // Update info element
  updateInfoElement(rect, scrollX, scrollY)
}

function updateOrCreateLines(rect: DOMRect, useSolidLines: boolean) {
  const horizontalLines = [
    createLine("horizontal", rect.top, !useSolidLines),
    createLine("horizontal", rect.bottom, !useSolidLines)
  ]
  const verticalLines = [
    createLine("vertical", rect.left, !useSolidLines),
    createLine("vertical", rect.right, !useSolidLines)
  ]
  highlightLines = [...horizontalLines, ...verticalLines]
  highlightLines.forEach((line) => document.body.appendChild(line))
}

function updateInfoElement(rect: DOMRect, scrollX: number, scrollY: number) {
  if (!infoElement) {
    infoElement = createInfoElement()
  }
  infoElement.textContent = `${Math.round(rect.width)}x${Math.round(rect.height)}`
  infoElement.style.left = `${rect.left + scrollX}px`
  infoElement.style.top = `${Math.max(0, rect.top + scrollY - 20)}px`
  document.body.appendChild(infoElement)
}

export function removeHighlight() {
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
