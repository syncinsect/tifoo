import fs from "fs"
import path from "path"

interface CssProperties {
  [key: string]: string
}

interface CssJson {
  [className: string]: CssProperties
}

function cssToJson(filePath: string): CssJson | undefined {
  if (!fs.existsSync(filePath)) {
    console.log(`file ${filePath} does not exist`)
    return
  }

  let cssContent: string = fs.readFileSync(filePath, "utf-8")

  // remove CSS comments
  cssContent = cssContent.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, "")

  // match class selectors and their properties, support multi-line
  const classRegex: RegExp = /([^{}]+)\s*{\s*([^{}]+)\s*}/g
  const cssJson: CssJson = {}

  let match: RegExpExecArray | null
  while ((match = classRegex.exec(cssContent)) !== null) {
    let selectors: string[] = match[1]
      .replace(/\s*\n\s*/g, " ")
      .trim()
      .split(",")
    let properties: string = match[2].trim()

    selectors.forEach((selector: string) => {
      selector = selector.trim()
      // only process class selectors, global selectors (*) and pseudo-elements
      if (
        selector.startsWith(".") ||
        selector === "*" ||
        selector.startsWith("::")
      ) {
        let className: string = selector.startsWith(".")
          ? selector.slice(1)
          : selector
        // dealing with pseudo-classes and pseudo-elements
        className = className.replace(/\\:/g, ":").replace(/\\/g, "")

        // convert attributed string to object
        const propsObj: CssProperties = {}
        properties.split(";").forEach((prop: string) => {
          const [key, value] = prop
            .split(":")
            .map((item: string) => item.trim())
          if (key && value) {
            propsObj[key] = value
          }
        })

        // add to cssJson only if the property object is not empty
        if (Object.keys(propsObj).length > 0) {
          cssJson[className] = propsObj
        }
      }
    })
  }

  return cssJson
}

function saveCssJsonToFile(cssJson: CssJson, outputPath: string): void {
  fs.writeFileSync(outputPath, JSON.stringify(cssJson, null, 2))
  console.log(`JSON saved ${outputPath}`)
}

const cssFilePath: string = path.join(__dirname, "output.css")
const jsonFilePath: string = path.join(__dirname, "output.json")

const cssJson: CssJson | undefined = cssToJson(cssFilePath)
if (cssJson) {
  saveCssJsonToFile(cssJson, jsonFilePath)
  console.log("Complete")
}
