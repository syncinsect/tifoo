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
let floatingWindowOffset = { x: 0, y: 0 }

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
  const tailwindPattern = new RegExp(
    `^(
    bg-\\w+(-\\d+)?|
    cursor-\\w+|
    items-\\w+|
    rounded-\\w+|
    p[xy]?-\\d+|
    text-\\w+(-\\d+)?|
    font-\\w+|
    hover:[\\w-]+|
    [mp][xytrblf]?-[0-9]+(/[0-9]+)?|
    (w|h)-([0-9]+(/[0-9]+)?|full|screen|auto)|
    (min|max)-(w|h)-([0-9]+(/[0-9]+)?|full|screen|auto)|
    flex(-[a-z]+)?|
    grid(-[a-z]+)?|
    (col|row)-((span-)?[0-9]+|auto|full)|
    (justify|content|items|self)-[a-z-]+|
    (shadow)(-[a-z]+)?|
    (focus|active|group-hover|dark):[\\w-]+|
    (sm|md|lg|xl|2xl):[\\w-]+|
    transition(-[a-z]+)?|
    transform|scale-[0-9]+|rotate-[0-9]+|translate-[xy]-[0-9]+|skew-[xy]-[0-9]+|
    (opacity|z)-[0-9]+|
    (overflow|object|tracking|leading|align|whitespace|break|select|resize|list|appearance)-[a-z-]+|
    (sr|not-sr)-[a-z]+|
    (block|inline|inline-block|hidden)
  )$`.replace(/\s+/g, ""),
    "i"
  )

  return allClasses.filter((cls) => tailwindPattern.test(cls))
}

function createFloatingWindow(element: HTMLElement): HTMLElement {
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

  const tagsContainer = createElementWithStyles("div", {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px"
  })

  const tailwindClasses = identifyTailwindClasses(element)
  tailwindClasses.forEach((cls, index) => {
    const tagElement = createElementWithStyles("label", {
      backgroundColor: "rgb(31, 41, 55)",
      color: "rgb(209, 213, 219)",
      padding: "4px 8px",
      borderRadius: "4px",
      fontSize: "12px",
      display: "flex",
      alignItems: "center",
      userSelect: "none",
      cursor: "pointer"
    })

    const checkbox = createElementWithStyles("input", {
      appearance: "none",
      webkitAppearance: "none",
      width: "16px",
      height: "16px",
      border: "2px solid rgb(209, 213, 219)",
      borderRadius: "3px",
      marginRight: "8px",
      position: "relative",
      outline: "none"
    }) as HTMLInputElement
    checkbox.type = "checkbox"
    checkbox.checked = element.classList.contains(cls)
    checkbox.id = `tailwind-class-${index}`

    updateCheckboxStyle(checkbox)

    tagElement.appendChild(checkbox)

    const text = document.createElement("span")
    text.textContent = cls
    tagElement.appendChild(text)

    tagElement.addEventListener("click", (e) => {
      if (e.target !== checkbox) {
        checkbox.checked = !checkbox.checked
      }
      updateCheckboxStyle(checkbox)
      handleClassToggle(element, cls, checkbox.checked)
    })

    tagsContainer.appendChild(tagElement)
  })

  window.appendChild(tagsContainer)

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
  input.placeholder = "Add class"
  input.addEventListener("keydown", (e) => handleAddClass(e, element))
  window.appendChild(input)

  document.body.appendChild(window)
  return window
}

function updateCheckboxStyle(checkbox: HTMLInputElement) {
  if (checkbox.checked) {
    checkbox.style.backgroundColor = "rgb(59, 130, 246)"
    checkbox.style.borderColor = "rgb(59, 130, 246)"
    checkbox.style.backgroundImage =
      'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z"/></svg>\')'
    checkbox.style.backgroundSize = "10px"
    checkbox.style.backgroundRepeat = "no-repeat"
    checkbox.style.backgroundPosition = "center"
  } else {
    checkbox.style.backgroundColor = "transparent"
    checkbox.style.borderColor = "rgb(209, 213, 219)"
    checkbox.style.backgroundImage = "none"
  }
}

function handleClassToggle(
  element: HTMLElement,
  className: string,
  isChecked: boolean
) {
  if (isChecked) {
    element.classList.add(className)
  } else {
    element.classList.remove(className)
  }

  void element.offsetWidth

  updateHighlight(element)

  // JIT mode
  if (window.Tailwind && typeof window.Tailwind.refresh === "function") {
    window.Tailwind.refresh()
  }

  if (floatingWindow) {
    updateFloatingWindowClasses(element)
  }
}

function updateFloatingWindowClasses(element: HTMLElement) {
  if (!floatingWindow) return

  const tagsContainer = floatingWindow.querySelector(
    ".tags-container"
  ) as HTMLElement
  if (!tagsContainer) return

  const currentClasses = new Set(identifyTailwindClasses(element))

  Array.from(tagsContainer.children).forEach((tagElement: HTMLElement) => {
    const checkbox = tagElement.querySelector(
      'input[type="checkbox"]'
    ) as HTMLInputElement
    const textSpan = tagElement.querySelector("span") as HTMLSpanElement
    if (checkbox && textSpan) {
      const className = textSpan.textContent
      if (className) {
        if (currentClasses.has(className)) {
          checkbox.checked = true
          currentClasses.delete(className)
        } else {
          checkbox.checked = false
        }
        updateCheckboxStyle(checkbox)
      }
    }
  })

  currentClasses.forEach((cls) => {
    const newTagElement = createClassTag(element, cls)
    tagsContainer.appendChild(newTagElement)
  })
}

function createClassTag(element: HTMLElement, cls: string): HTMLElement {
  const tagElement = createElementWithStyles("label", {
    backgroundColor: "rgb(31, 41, 55)",
    color: "rgb(209, 213, 219)",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "12px",
    display: "flex",
    alignItems: "center",
    userSelect: "none",
    cursor: "pointer",
    marginBottom: "4px"
  })

  const checkbox = createElementWithStyles("input", {
    appearance: "none",
    webkitAppearance: "none",
    width: "16px",
    height: "16px",
    border: "2px solid rgb(209, 213, 219)",
    borderRadius: "3px",
    marginRight: "8px",
    position: "relative",
    outline: "none"
  }) as HTMLInputElement
  checkbox.type = "checkbox"
  checkbox.checked = true

  updateCheckboxStyle(checkbox)

  checkbox.addEventListener("change", () => {
    updateCheckboxStyle(checkbox)
    handleClassToggle(element, cls, checkbox.checked)
  })

  tagElement.appendChild(checkbox)

  const text = document.createElement("span")
  text.textContent = cls
  tagElement.appendChild(text)

  return tagElement
}

function handleAddClass(event: KeyboardEvent, element: HTMLElement) {
  if (event.key === "Enter") {
    const input = event.target as HTMLInputElement
    const newClass = input.value.trim()
    if (newClass) {
      element.classList.add(newClass)
      updateHighlight(element)
      input.value = ""
      createFloatingWindow(element) // Recreate the window to show the new class
    }
  }
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

  const rect = lastHighlightedElement.getBoundingClientRect()
  const scrollX = window.pageXOffset || document.documentElement.scrollLeft
  const scrollY = window.pageYOffset || document.documentElement.scrollTop

  floatingWindowOffset.x = e.pageX - (rect.left + scrollX)
  floatingWindowOffset.y = e.pageY - (rect.top + scrollY)

  floatingWindow.style.left = `${e.pageX}px`
  floatingWindow.style.top = `${e.pageY}px`
  floatingWindow.style.pointerEvents = "auto"
  document.removeEventListener("mousemove", updateFloatingWindowPosition)

  floatingWindow.style.display = "block"

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
  }
}

function handleMouseOver(e: MouseEvent) {
  if (!isActive || isFloatingWindowFixed) return
  const target = e.target as HTMLElement
  lastHighlightedElement = target
  throttledUpdateHighlight(target)

  // Update floating window with Tailwind classes of the hovered element
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
    updateHighlight(lastHighlightedElement, rect, isFloatingWindowFixed)

    if (floatingWindow && isFloatingWindowFixed) {
      const scrollX = window.pageXOffset || document.documentElement.scrollLeft
      const scrollY = window.pageYOffset || document.documentElement.scrollTop

      floatingWindow.style.left = `${rect.left + scrollX + floatingWindowOffset.x}px`
      floatingWindow.style.top = `${rect.top + scrollY + floatingWindowOffset.y}px`
    }
  }
}

let scrollRAF: number | null = null

function optimizedHandleScroll() {
  if (scrollRAF !== null) {
    cancelAnimationFrame(scrollRAF)
  }
  scrollRAF = requestAnimationFrame(() => {
    handleScroll()
    scrollRAF = null
  })
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
    updateHighlight(target)
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
  window.addEventListener("scroll", optimizedHandleScroll, { passive: true })
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
  window.removeEventListener("scroll", optimizedHandleScroll)
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
      updateHighlight(lastHighlightedElement, null, false)
    }
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
      // If it's not the first time, perform a smooth transition
      animateHighlight(element, lastRect, rect, useSolidLines)
    }
    lastRect = rect
    highlightUpdateTimeout = null
  }, 20) // Reduce the delay time from 50ms to 20ms
}

function animateHighlight(
  element: HTMLElement,
  startRect: DOMRect,
  endRect: DOMRect,
  useSolidLines: boolean
) {
  const startTime = performance.now()
  const duration = 150

  function animate(currentTime: number) {
    const elapsedTime = currentTime - startTime
    const progress = Math.min(elapsedTime / duration, 1)

    const easeProgress = easeOutCubic(progress)

    const currentRect = {
      left: interpolate(startRect.left, endRect.left, easeProgress),
      top: interpolate(startRect.top, endRect.top, easeProgress),
      width: interpolate(startRect.width, endRect.width, easeProgress),
      height: interpolate(startRect.height, endRect.height, easeProgress),
      right: interpolate(startRect.right, endRect.right, easeProgress),
      bottom: interpolate(startRect.bottom, endRect.bottom, easeProgress)
    } as DOMRect

    updateHighlight(element, currentRect, useSolidLines)

    if (progress < 1) {
      requestAnimationFrame(animate)
    }
  }

  requestAnimationFrame(animate)
}

// use a faster easing function
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

function interpolate(start: number, end: number, progress: number): number {
  return start + (end - start) * progress
}

declare global {
  interface Window {
    Tailwind?: {
      refresh: () => void
    }
  }
}
