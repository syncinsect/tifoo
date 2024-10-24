import { chromium } from "playwright"

describe("Tailware Extension E2E", () => {
  let browser
  let page

  beforeAll(async () => {
    browser = await chromium.launch({
      headless: false,
      args: [
        "--disable-extensions-except=./path/to/your/extension",
        "--load-extension=./path/to/your/extension"
      ]
    })
  })

  beforeEach(async () => {
    page = await browser.newPage()
    await page.goto("https://example.com")
  })

  test("Tailware activates and highlights elements", async () => {
    await page.click("#tailware-toggle")
    await page.hover("h1")
    const highlightBox = await page.$(".highlight-box")
    expect(highlightBox).not.toBeNull()
  })

  afterAll(async () => {
    await browser.close()
  })
})
