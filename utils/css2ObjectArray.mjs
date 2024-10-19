import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

function cssToObjectArray(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`file ${filePath} does not exist`)
    return
  }

  let cssContent = fs.readFileSync(filePath, "utf-8")

  // remove CSS comments
  cssContent = cssContent.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, "")

  // match class selectors and their properties, support multi-line
  const classRegex = /([^{}]+)\s*{\s*([^{}]+)\s*}/g
  const cssArray = []

  let match
  while ((match = classRegex.exec(cssContent)) !== null) {
    let selectors = match[1]
      .replace(/\s*\n\s*/g, " ")
      .trim()
      .split(",")
    let properties = match[2].trim()

    selectors.forEach((selector) => {
      selector = selector.trim()
      if (
        selector.startsWith(".") ||
        selector === "*" ||
        selector.startsWith("::")
      ) {
        let className = selector.startsWith(".") ? selector.slice(1) : selector
        className = className.replace(/\\:/g, ":").replace(/\\/g, "")

        const propsString = properties
          .split(";")
          .map((prop) => {
            const [key, value] = prop.split(":").map((item) => item.trim())
            return key && value ? `${key}:${value}` : null
          })
          .filter(Boolean)
          .join(";")

        if (propsString) {
          cssArray.push({ c: className, p: propsString })
        }
      }
    })
  }

  return cssArray
}

function saveCssArrayToFile(cssArray, outputPath) {
  fs.writeFileSync(outputPath, JSON.stringify(cssArray))
  console.log(`Compressed JSON saved to ${outputPath}`)
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const cssFilePath = path.join(__dirname, "output.css")
const jsonFilePath = path.join(__dirname, "output.min.json")

const cssArray = cssToObjectArray(cssFilePath)
if (cssArray) {
  saveCssArrayToFile(cssArray, jsonFilePath)
  console.log("Complete")
}
