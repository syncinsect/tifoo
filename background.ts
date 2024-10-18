import { Storage } from "@plasmohq/storage"

const storage = new Storage()

chrome.runtime.onInstalled.addListener(async () => {
  await storage.set("isActive", false)
})

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    const isActive = await storage.get("isActive")
    if (isActive) {
      chrome.tabs.sendMessage(tabId, {
        action: "toggleScanner",
        isActive: true
      })
    }
  }
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getState") {
    storage
      .get("isActive")
      .then((isActive) => {
        sendResponse({ isActive: isActive || false })
      })
      .catch((error) => {
        console.error("Error getting state:", error)
        sendResponse({ isActive: false, error: error.message })
      })
    return true
  }
})
