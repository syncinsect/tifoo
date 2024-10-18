import fs from "fs"
import path from "path"

function countCssClasses(filePath: string): void {
  if (!fs.existsSync(filePath)) {
    console.log(`file ${filePath} does not exist`)
    return
  }

  const cssContent: string = fs.readFileSync(filePath, "utf-8")

  // use RegExp to match CSS classes
  const classPattern: RegExp = /\.[-_a-zA-Z0-9]+[^{]*{/g
  const classes: RegExpMatchArray | null = cssContent.match(classPattern)

  if (!classes) {
    console.log("no CSS classes found")
    return
  }

  // calculate the number of unique classes
  const uniqueClasses: Set<string> = new Set(classes)

  console.log(`total classes: ${classes.length}`)
  console.log(`unique classes: ${uniqueClasses.size}`)
}

// example usage
const cssFilePath: string = path.join(__dirname, "output.css") // replace with your CSS file path
countCssClasses(cssFilePath)
