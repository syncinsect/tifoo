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

function addMarginHighlight(
  outerBox: HTMLElement,
  styles: ReturnType<typeof getElementStyles>
) {
  const directions = ["top", "right", "bottom", "left"] as const
  directions.forEach((direction) => {
    if (styles.margin[direction] > 0) {
      const marginBox = createBoxElement(
        {
          position: "absolute",
          [direction]: `-${styles.margin[direction]}px`,
          [direction === "left" || direction === "right" ? "width" : "height"]:
            `${styles.margin[direction]}px`,
          [direction === "left" || direction === "right" ? "height" : "width"]:
            "100%"
        },
        colors.margin
      )
      outerBox.appendChild(marginBox)
    }
  })
}

function updateHighlight(element: HTMLElement) {
  removeHighlight()

  const rect = element.getBoundingClientRect()
  const styles = getElementStyles(element)
  const scrollX = window.pageXOffset || document.documentElement.scrollLeft
  const scrollY = window.pageYOffset || document.documentElement.scrollTop

  const container = createElementWithStyles("div", {
    position: "absolute",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    zIndex: "9997"
  })

  highlightLines = [
    createLine("horizontal", rect.top + scrollY),
    createLine("horizontal", rect.bottom + scrollY),
    createLine("vertical", rect.left + scrollX),
    createLine("vertical", rect.right + scrollX)
  ]

  const outerBox = createHighlightBox()
  Object.assign(outerBox.style, {
    left: `${rect.left + scrollX}px`,
    top: `${rect.top + scrollY}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    boxSizing: "border-box",
    border: `2px solid ${colors.border}`
  })

  const paddingBox = createBoxElement(
    {
      position: "absolute",
      left: "0",
      top: "0",
      width: "100%",
      height: "100%",
      boxSizing: "border-box"
    },
    colors.padding
  )

  const innerBox = createBoxElement(
    {
      position: "absolute",
      left: `${styles.padding.left}px`,
      top: `${styles.padding.top}px`,
      right: `${styles.padding.right}px`,
      bottom: `${styles.padding.bottom}px`
    },
    colors.content
  )

  outerBox.appendChild(paddingBox)
  outerBox.appendChild(innerBox)

  addMarginHighlight(outerBox, styles)

  if (!infoElement) {
    infoElement = createInfoElement()
  }
  Object.assign(infoElement.style, {
    left: `${rect.left}px`,
    top: `${rect.bottom + 5}px`
  })
  infoElement.innerHTML = `
    Padding: ${styles.padding.top} ${styles.padding.right} ${styles.padding.bottom} ${styles.padding.left}<br>
    Margin: ${styles.margin.top} ${styles.margin.right} ${styles.margin.bottom} ${styles.margin.left}
  `

  container.appendChild(outerBox)
  document.body.appendChild(container)
  highlightBox = container
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

function handleMouseOver(e: MouseEvent) {
  if (!isActive) return
  const target = e.target as HTMLElement
  lastHighlightedElement = target
  updateHighlight(target)
}

function handleMouseOut() {
  if (!isActive) return
  removeHighlight()
}

function handleScroll() {
  if (lastHighlightedElement) {
    updateHighlight(lastHighlightedElement)
  }
}

function createFloatingWindow(): HTMLElement {
  const window = createElementWithStyles("div", {
    position: "fixed",
    pointerEvents: "none",
    zIndex: "10001",
    backgroundColor: "white",
    border: "1px solid black",
    padding: "10px",
    borderRadius: "5px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.2)"
  })
  window.textContent = "Float Window"
  document.body.appendChild(window)
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

      if (!floatingWindow) {
        floatingWindow = createFloatingWindow()
      }
    } else {
      document.removeEventListener("mouseover", handleMouseOver)
      document.removeEventListener("mouseout", handleMouseOut)
      window.removeEventListener("scroll", handleScroll)
      document.removeEventListener("mousemove", updateFloatingWindowPosition)
      document.removeEventListener("click", fixFloatingWindow, true)
      document.removeEventListener("click", disablePageClicks, true)
      removeHighlight()
      lastHighlightedElement = null

      if (floatingWindow) {
        floatingWindow.remove()
        floatingWindow = null
      }
      isFloatingWindowFixed = false
    }
  }
})
