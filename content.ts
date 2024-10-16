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
let highlightUpdateTimeout: ReturnType<typeof setTimeout> | null = null
let lastRect: DOMRect | null = null

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
  element.style.transition = "all 0.3s ease" // Add transition effect
  return element
}

function createLine(
  position: "horizontal" | "vertical",
  offset: number,
  isDashed: boolean = true
): HTMLElement {
  const line = createElementWithStyles("div", {
    position: position === "horizontal" ? "absolute" : "fixed",
    backgroundColor: "transparent",
    zIndex: "9999",
    pointerEvents: "none",
    [position === "horizontal" ? "width" : "height"]: "100%",
    [position === "horizontal" ? "height" : "width"]: "0",
    [position === "horizontal" ? "left" : "top"]: "0",
    [position === "horizontal" ? "top" : "left"]: `${offset}px`,
    borderStyle: isDashed ? "dashed" : "solid",
    borderColor: colors.border,
    borderWidth: position === "horizontal" ? "2px 0 0 0" : "0 0 0 2px",
    ...(isDashed ? { borderDasharray: "6, 4" } : {}),
    transition: "all 0.3s ease" // Add transition effect
  })
  return line
}

function createHighlightBox(): HTMLElement {
  return createElementWithStyles("div", {
    position: "absolute", // Change back to absolute positioning
    pointerEvents: "none",
    zIndex: "9998",
    transition: "none" // Remove transition effect as we now use animation
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

function updateHighlight(
  element: HTMLElement,
  rect: DOMRect | null = null,
  useSolidLines: boolean = false
) {
  const styles = getElementStyles(element)

  if (!rect) {
    rect = element.getBoundingClientRect()
  }

  const scrollX = window.pageXOffset || document.documentElement.scrollLeft
  const scrollY = window.pageYOffset || document.documentElement.scrollTop

  if (!highlightBox) {
    highlightBox = createHighlightBox()
    document.body.appendChild(highlightBox)
  }

  // Update highlight box position and size, considering scroll position
  highlightBox.style.left = `${rect.left + scrollX}px`
  highlightBox.style.top = `${rect.top + scrollY}px`
  highlightBox.style.width = `${rect.width}px`
  highlightBox.style.height = `${rect.height}px`

  // Clear existing child elements
  while (highlightBox.firstChild) {
    highlightBox.removeChild(highlightBox.firstChild)
  }

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

  // Update or create auxiliary lines
  updateOrCreateLines(rect, scrollY, useSolidLines)

  // Update info element
  updateInfoElement(rect, scrollX, scrollY)
}

function updateOrCreateLines(
  rect: DOMRect,
  scrollY: number,
  useSolidLines: boolean
) {
  if (highlightLines.length === 4) {
    // Update existing lines
    highlightLines[0].style.top = `${rect.top + scrollY}px`
    highlightLines[1].style.top = `${rect.bottom + scrollY}px`
    highlightLines[2].style.left = `${rect.left}px`
    highlightLines[3].style.left = `${rect.right}px`
  } else {
    // Create new lines
    const horizontalLines = [
      createLine("horizontal", rect.top + scrollY, !useSolidLines),
      createLine("horizontal", rect.bottom + scrollY, !useSolidLines)
    ]
    const verticalLines = [
      createLine("vertical", rect.left, !useSolidLines),
      createLine("vertical", rect.right, !useSolidLines)
    ]
    highlightLines = [...horizontalLines, ...verticalLines]
    highlightLines.forEach((line) => document.body.appendChild(line))
  }
}

function updateInfoElement(rect: DOMRect, scrollX: number, scrollY: number) {
  if (!infoElement) {
    infoElement = createInfoElement()
  }
  infoElement.textContent = `${Math.round(rect.width)}x${Math.round(rect.height)}`
  infoElement.style.left = `${rect.left + scrollX}px`
  infoElement.style.top = `${Math.max(0, rect.top + scrollY - 20)}px`
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
    zIndex: "10001",
    backgroundColor: "rgb(17, 24, 39)",
    border: "2px solid rgb(55, 65, 81)",
    borderRadius: "8px",
    padding: "12px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    width: "280px",
    fontFamily: "Arial, sans-serif"
  })

  // Add close button
  const closeButton = createElementWithStyles("button", {
    position: "absolute",
    right: "8px",
    top: "8px",
    backgroundColor: "transparent",
    border: "none",
    color: "rgb(209, 213, 219)",
    fontSize: "16px",
    cursor: "pointer"
  })
  closeButton.textContent = "×"
  closeButton.addEventListener("click", removeFloatingWindow)
  window.appendChild(closeButton)

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
  if (!isActive || !floatingWindow || !lastHighlightedElement) return
  e.preventDefault()
  e.stopPropagation()
  isFloatingWindowFixed = true
  floatingWindow.style.position = "absolute"
  floatingWindow.style.left = `${e.pageX}px`
  floatingWindow.style.top = `${e.pageY}px`
  floatingWindow.style.pointerEvents = "auto"
  document.removeEventListener("mousemove", updateFloatingWindowPosition)

  // Add this line to prevent the window from being removed on mouseout
  floatingWindow.style.display = "block"

  // Update highlight with solid lines
  updateHighlight(lastHighlightedElement, null, true)
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
  if (!isActive || isFloatingWindowFixed) return
  const target = e.target as HTMLElement
  lastHighlightedElement = target
  throttledUpdateHighlight(target)

  // Update floating window
  if (floatingWindow && !isFloatingWindowFixed) {
    floatingWindow.remove()
  }
  if (!isFloatingWindowFixed) {
    floatingWindow = createFloatingWindow(target)
  }
}

function handleMouseOut() {
  if (!isActive || isFloatingWindowFixed) return
  removeHighlight()
  if (floatingWindow && !isFloatingWindowFixed) {
    floatingWindow.remove()
    floatingWindow = null
  }
}

function handleScroll() {
  if (lastHighlightedElement) {
    const rect = lastHighlightedElement.getBoundingClientRect()
    const scrollY = window.pageYOffset || document.documentElement.scrollTop

    // Update horizontal lines position
    if (highlightLines.length >= 2) {
      highlightLines[0].style.top = `${rect.top + scrollY}px`
      highlightLines[1].style.top = `${rect.bottom + scrollY}px`
    }

    // Update highlight box position
    if (highlightBox) {
      highlightBox.style.top = `${rect.top + scrollY}px`
    }

    // Update info element position
    if (infoElement) {
      infoElement.style.top = `${Math.max(0, rect.top + scrollY - 20)}px`
    }

    // Update floating window position (if not fixed)
    if (floatingWindow && !isFloatingWindowFixed) {
      floatingWindow.style.left = `${rect.left}px`
      floatingWindow.style.top = `${rect.top + scrollY}px`
    }
  }
}

function handleClick(e: MouseEvent) {
  if (!isActive) return
  if (floatingWindow) {
    if (!floatingWindow.contains(e.target as Node)) {
      if (isFloatingWindowFixed) {
        unfixFloatingWindow()
      } else {
        fixFloatingWindow(e)
      }
    }
  } else {
    const target = e.target as HTMLElement
    lastHighlightedElement = target
    updateHighlight(target, null, false) // Add null as the second argument
    floatingWindow = createFloatingWindow(target)
    fixFloatingWindow(e)
  }
}

function throttle(func: Function, limit: number) {
  let inThrottle: boolean
  return function (this: any) {
    const args = arguments
    const context = this
    if (!inThrottle) {
      func.apply(context, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

function activateScanner() {
  document.addEventListener("mouseover", handleMouseOver)
  document.addEventListener("mouseout", handleMouseOut)
  const throttledHandleScroll = throttle(handleScroll, 100)
  window.addEventListener("scroll", throttledHandleScroll)
  document.addEventListener("mousemove", updateFloatingWindowPosition)
  document.addEventListener("click", handleClick, true)

  isFloatingWindowFixed = false
  if (floatingWindow) {
    floatingWindow.remove()
    floatingWindow = null
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggleScanner") {
    isActive = request.isActive
    if (isActive) {
      activateScanner()
    } else {
      deactivateScanner()
    }
  }
})

function deactivateScanner() {
  document.removeEventListener("mouseover", handleMouseOver)
  document.removeEventListener("mouseout", handleMouseOut)
  const throttledHandleScroll = throttle(handleScroll, 100)
  window.removeEventListener("scroll", throttledHandleScroll)
  document.removeEventListener("mousemove", updateFloatingWindowPosition)
  document.removeEventListener("click", handleClick, true)
  removeHighlight()
  lastHighlightedElement = null

  removeFloatingWindow()
  isFloatingWindowFixed = false
}

function unfixFloatingWindow() {
  if (floatingWindow) {
    isFloatingWindowFixed = false
    floatingWindow.style.position = "fixed"
    floatingWindow.style.pointerEvents = "none"
    document.addEventListener("mousemove", updateFloatingWindowPosition)

    // Update highlight with dashed lines
    if (lastHighlightedElement) {
      updateHighlight(lastHighlightedElement, null, false) // Add null as the second argument
    }
  }
}

function throttledUpdateHighlight(
  element: HTMLElement,
  useSolidLines: boolean = false
) {
  if (highlightUpdateTimeout) {
    clearTimeout(highlightUpdateTimeout)
  }

  highlightUpdateTimeout = setTimeout(() => {
    const rect = element.getBoundingClientRect()
    if (!lastRect) {
      // If it's the first highlight, update directly
      updateHighlight(element, rect, useSolidLines)
    } else {
      // If not the first time, perform smooth transition
      animateHighlight(element, lastRect, rect, useSolidLines)
    }
    lastRect = rect
    highlightUpdateTimeout = null
  }, 20) // Reduce delay time from 50ms to 20ms
}

function animateHighlight(
  element: HTMLElement,
  startRect: DOMRect,
  endRect: DOMRect,
  useSolidLines: boolean
) {
  const startTime = performance.now()
  const duration = 100

  function animate(currentTime: number) {
    const elapsedTime = currentTime - startTime
    const progress = Math.min(elapsedTime / duration, 1)

    const easeProgress = easeOutQuad(progress)

    const scrollX = window.pageXOffset || document.documentElement.scrollLeft
    const scrollY = window.pageYOffset || document.documentElement.scrollTop

    const currentRect = {
      left: interpolate(startRect.left, endRect.left, easeProgress) + scrollX,
      top: interpolate(startRect.top, endRect.top, easeProgress) + scrollY,
      width: interpolate(startRect.width, endRect.width, easeProgress),
      height: interpolate(startRect.height, endRect.height, easeProgress),
      right:
        interpolate(startRect.right, endRect.right, easeProgress) + scrollX,
      bottom:
        interpolate(startRect.bottom, endRect.bottom, easeProgress) + scrollY
    } as DOMRect

    updateHighlight(element, currentRect, useSolidLines)

    if (progress < 1) {
      requestAnimationFrame(animate)
    }
  }

  requestAnimationFrame(animate)
}

// Use a faster easing function
function easeOutQuad(t: number): number {
  return t * (2 - t)
}

function interpolate(start: number, end: number, progress: number): number {
  return start + (end - start) * progress
}
