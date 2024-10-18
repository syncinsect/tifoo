import tailwindClasses from "./tailwind-classes.json"

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
let floatingWindowPosition = { x: 0, y: 0 }
let initialClickPosition = { x: 0, y: 0 }

const colors = {
  border: "rgba(59, 130, 246, 0.5)",
  padding: "rgba(147, 196, 125, 0.55)",
  margin: "rgba(246, 178, 107, 0.66)",
  content: "rgba(111, 168, 220, 0.66)"
}

type TrieNode = {
  [key: string]: TrieNode | string
}

let tailwindClassesTrie: TrieNode = {}

function buildTailwindClassesTrie(classes: { [key: string]: string }) {
  for (const className of Object.keys(classes)) {
    let node = tailwindClassesTrie
    for (const char of className) {
      if (!node[char]) {
        node[char] = {}
      }
      node = node[char] as TrieNode
    }
    node["$"] = className
  }
}

function searchTailwindClasses(prefix: string, limit: number = 10): string[] {
  const results: string[] = []
  const queue: [TrieNode, string][] = [[tailwindClassesTrie, ""]]

  while (queue.length > 0 && results.length < limit) {
    const [node, current] = queue.shift()!

    if ("$" in node && current.includes(prefix)) {
      results.push(current)
    }

    for (const [char, childNode] of Object.entries(node)) {
      if (char !== "$") {
        queue.push([childNode as TrieNode, current + char])
      }
    }
  }

  return results
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
function identifyTailwindClasses(element) {
  let classNames = []

  if (element.className) {
    if (typeof element.className === "string") {
      classNames = element.className.split(/\s+/)
    } else if (element.className.baseVal) {
      classNames = element.className.baseVal.split(/\s+/)
    }
  } else if (element.classList && element.classList.length) {
    classNames = Array.from(element.classList)
  }

  const tailwindPattern = new RegExp(
    "^(bg-|text-|p-|m-|flex|grid|border|shadow|rounded|transition|transform|cursor-|hover:|focus:|active:|disabled:)"
  )

  return classNames.filter((className) => tailwindPattern.test(className))
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
    fontFamily: "Arial, sans-serif",
    color: "white"
  })

  const header = createElementWithStyles("div", {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
    paddingBottom: "8px",
    borderBottom: "1px solid rgb(55, 65, 81)"
  })

  const tailwindText = createElementWithStyles("span", {
    fontWeight: "bold",
    fontSize: "14px"
  })
  tailwindText.textContent = "tailware"
  header.appendChild(tailwindText)

  const buttonContainer = createElementWithStyles("div", {
    display: "flex",
    gap: "8px"
  })

  const buttonStyles = {
    backgroundColor: "transparent",
    border: "none",
    color: "rgb(209, 213, 219)",
    cursor: "pointer",
    padding: "4px",
    borderRadius: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "24px",
    height: "24px"
  }

  const copyClassesButton = createElementWithStyles(
    "button",
    buttonStyles
  ) as HTMLButtonElement
  copyClassesButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`
  copyClassesButton.title = "Copy Classes"
  copyClassesButton.addEventListener("click", () => copyClasses(element))

  const copyElementButton = createElementWithStyles(
    "button",
    buttonStyles
  ) as HTMLButtonElement
  copyElementButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>`
  copyElementButton.title = "Copy Element"
  copyElementButton.addEventListener("click", () => copyElement(element))

  const closeButton = createElementWithStyles(
    "button",
    buttonStyles
  ) as HTMLButtonElement
  closeButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`
  closeButton.title = "Close"
  closeButton.addEventListener("click", removeFloatingWindow)

  buttonContainer.appendChild(copyClassesButton)
  buttonContainer.appendChild(copyElementButton)
  buttonContainer.appendChild(closeButton)

  header.appendChild(buttonContainer)

  window.appendChild(header)

  const tagsContainer = createElementWithStyles("div", {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px"
  })
  tagsContainer.className = "tags-container"

  const tailwindClasses = identifyTailwindClasses(element)
  tailwindClasses.forEach((cls, index) => {
    const tagElement = createClassTag(element, cls)
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
  input.placeholder = "Add Classes"
  window.appendChild(input)

  const autocompleteList = createElementWithStyles("ul", {
    position: "absolute",
    top: "calc(100% + 4px)",
    left: "0",
    right: "0",
    backgroundColor: "rgb(24, 31, 46)",
    border: "1px solid rgb(55, 65, 81)",
    borderRadius: "6px",
    maxHeight: "200px",
    overflowY: "auto",
    display: "none",
    zIndex: "10002",
    listStyle: "none",
    padding: "4px 0",
    margin: "0",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    fontFamily: "Arial, sans-serif",
    fontSize: "12px"
  })

  autocompleteList.style.scrollbarWidth = "thin"
  autocompleteList.style.scrollbarColor = "rgb(75, 85, 99) rgb(31, 41, 55)"

  let selectedIndex = -1

  input.addEventListener("input", () => {
    const value = input.value.trim().toLowerCase()
    if (value === "") {
      autocompleteList.style.display = "none"
      return
    }

    const matches = searchTailwindClasses(value)
    autocompleteList.innerHTML = ""
    autocompleteList.style.display = matches.length ? "block" : "none"
    matches.forEach((match, index) => {
      const li = createElementWithStyles("li", {
        padding: "6px 12px",
        cursor: "pointer",
        transition: "background-color 0.2s",
        color: "rgb(209, 213, 219)"
      })

      const matchIndex = match.toLowerCase().indexOf(value)
      if (matchIndex !== -1) {
        li.innerHTML =
          match.substring(0, matchIndex) +
          `<strong style="color: rgb(59, 130, 246);">${match.substring(matchIndex, matchIndex + value.length)}</strong>` +
          match.substring(matchIndex + value.length)
      } else {
        li.textContent = match
      }

      li.addEventListener("click", () => {
        input.value = match
        autocompleteList.style.display = "none"
        handleAddClass(
          { key: "Enter", target: input } as unknown as KeyboardEvent,
          element
        )
      })

      li.addEventListener("mouseover", () => {
        selectedIndex = index
        updateSelectedItem()
      })

      autocompleteList.appendChild(li)
    })
    selectedIndex = -1
    updateSelectedItem()
  })

  input.addEventListener("keydown", (e: KeyboardEvent) => {
    const items = autocompleteList.children
    if (items.length === 0) return

    if (e.key === "ArrowDown") {
      e.preventDefault()
      selectedIndex = (selectedIndex + 1) % items.length
      updateSelectedItem()
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      selectedIndex = (selectedIndex - 1 + items.length) % items.length
      updateSelectedItem()
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (selectedIndex !== -1) {
        const selectedItem = items[selectedIndex] as HTMLLIElement
        input.value = selectedItem.textContent || ""
      }
      autocompleteList.style.display = "none"
      handleAddClass(e, element)
    } else if (e.key === "Escape") {
      autocompleteList.style.display = "none"
    }
  })

  function updateSelectedItem() {
    const items = autocompleteList.children
    for (let i = 0; i < items.length; i++) {
      const item = items[i] as HTMLLIElement
      if (i === selectedIndex) {
        item.style.backgroundColor = "rgb(55, 65, 81)"
      } else {
        item.style.backgroundColor = ""
      }
    }
    if (selectedIndex !== -1) {
      const selectedItem = items[selectedIndex] as HTMLLIElement
      selectedItem.scrollIntoView({ block: "nearest" })
    }
  }

  window.appendChild(autocompleteList)

  document.body.appendChild(window)
  return window
}

function copyClasses(element: HTMLElement) {
  const classes = Array.from(element.classList).join(" ")
  navigator.clipboard
    .writeText(classes)
    .then(() => {
      showToast("Classes copied to clipboard!")
    })
    .catch((err) => {
      console.error("Failed to copy classes: ", err)
      showToast("Failed to copy classes", true)
    })
}

function copyElement(element: HTMLElement) {
  const elementString = element.outerHTML
  navigator.clipboard
    .writeText(elementString)
    .then(() => {
      showToast("Element copied to clipboard!")
    })
    .catch((err) => {
      console.error("Failed to copy element: ", err)
      showToast("Failed to copy element", true)
    })
}

function showToast(message: string, isError: boolean = false) {
  const toast = createElementWithStyles("div", {
    position: "fixed",
    bottom: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: isError ? "rgb(220, 38, 38)" : "rgb(34, 197, 94)",
    color: "white",
    padding: "8px 16px",
    borderRadius: "4px",
    fontSize: "14px",
    zIndex: "10002",
    opacity: "0",
    transition: "opacity 0.3s ease-in-out"
  })
  toast.textContent = message
  document.body.appendChild(toast)

  setTimeout(() => {
    toast.style.opacity = "1"
  }, 10)

  setTimeout(() => {
    toast.style.opacity = "0"
    setTimeout(() => {
      document.body.removeChild(toast)
    }, 300)
  }, 3000)
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
}

function updateFloatingWindowClasses(element: HTMLElement) {
  if (!floatingWindow) return

  const tagsContainer = floatingWindow.querySelector(
    ".tags-container"
  ) as HTMLElement
  if (!tagsContainer) return

  tagsContainer.innerHTML = ""

  const currentClasses = identifyTailwindClasses(element)
  currentClasses.forEach((cls, index) => {
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
    backgroundColor: "transparent",
    cursor: "pointer"
  }) as HTMLInputElement
  checkbox.type = "checkbox"
  checkbox.checked = element.classList.contains(cls)

  checkbox.addEventListener("focus", () => {
    checkbox.style.boxShadow = "none"
    checkbox.style.outline = "none"
  })

  checkbox.addEventListener("blur", () => {
    checkbox.style.boxShadow = ""
    checkbox.style.outline = ""
  })

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

      if (floatingWindow) {
        updateFloatingWindowClasses(element)
      }

      // JIT Mode
      if (window.Tailwind && typeof window.Tailwind.refresh === "function") {
        window.Tailwind.refresh()
      }
    }
  }
  const autocompleteList = floatingWindow?.querySelector("ul")
  if (autocompleteList) {
    autocompleteList.style.display = "none"
  }
}

function updateFloatingWindowPosition(e: MouseEvent) {
  if (!floatingWindow || isFloatingWindowFixed) return
  positionFloatingWindow(e)
}

function positionFloatingWindow(e: MouseEvent) {
  if (!floatingWindow || isFloatingWindowFixed) return

  const windowWidth = window.innerWidth
  const windowHeight = window.innerHeight
  const floatingWindowRect = floatingWindow.getBoundingClientRect()

  let left = e.clientX + 10
  let top = e.clientY + 10

  if (left + floatingWindowRect.width > windowWidth) {
    left = e.clientX - floatingWindowRect.width - 10
  }
  if (top + floatingWindowRect.height > windowHeight) {
    top = e.clientY - floatingWindowRect.height - 10
  }

  floatingWindow.style.left = `${left}px`
  floatingWindow.style.top = `${top}px`

  floatingWindowPosition = { x: left, y: top }
}

function fixFloatingWindow(e: MouseEvent) {
  if (!isActive || !floatingWindow || !lastHighlightedElement) return
  e.preventDefault()
  e.stopPropagation()
  isFloatingWindowFixed = true

  const floatingWindowRect = floatingWindow.getBoundingClientRect()
  const scrollX = window.pageXOffset || document.documentElement.scrollLeft
  const scrollY = window.pageYOffset || document.documentElement.scrollTop

  initialClickPosition = {
    x: e.clientX,
    y: e.clientY
  }

  const left = Math.round(floatingWindowRect.left + scrollX)
  const top = Math.round(floatingWindowRect.top + scrollY)

  floatingWindow.style.position = "absolute"
  floatingWindow.style.left = `${left}px`
  floatingWindow.style.top = `${top}px`

  floatingWindowPosition = { x: left, y: top }

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

  if (floatingWindow && !isFloatingWindowFixed) {
    updateFloatingWindowContent(target)
    positionFloatingWindow(e)
  } else if (!isFloatingWindowFixed) {
    floatingWindow = createFloatingWindow(target)
    positionFloatingWindow(e)
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

function updateFloatingWindowContent(element: HTMLElement) {
  if (!floatingWindow) return

  const tagsContainer = floatingWindow.querySelector(
    ".tags-container"
  ) as HTMLElement
  if (!tagsContainer) return

  tagsContainer.innerHTML = ""

  const tailwindClasses = identifyTailwindClasses(element)
  tailwindClasses.forEach((cls) => {
    const tagElement = createClassTag(element, cls)
    tagsContainer.appendChild(tagElement)
  })
}

function handleScroll() {
  if (lastHighlightedElement) {
    const rect = lastHighlightedElement.getBoundingClientRect()
    updateHighlight(lastHighlightedElement, rect, isFloatingWindowFixed)
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
  if (floatingWindow && lastHighlightedElement) {
    isFloatingWindowFixed = false

    const scrollX = window.pageXOffset || document.documentElement.scrollLeft
    const scrollY = window.pageYOffset || document.documentElement.scrollTop

    const left = Math.round(floatingWindowPosition.x - scrollX)
    const top = Math.round(floatingWindowPosition.y - scrollY)

    floatingWindow.style.position = "fixed"
    floatingWindow.style.left = `${left}px`
    floatingWindow.style.top = `${top}px`

    floatingWindow.style.pointerEvents = "none"
    document.addEventListener("mousemove", updateFloatingWindowPosition)

    updateHighlight(lastHighlightedElement, null, false)

    floatingWindow.style.display = "block"

    const mouseEvent = new MouseEvent("mousemove", {
      clientX: initialClickPosition.x,
      clientY: initialClickPosition.y
    })
    updateFloatingWindowPosition(mouseEvent)
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

buildTailwindClassesTrie(tailwindClasses)
