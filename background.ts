import { Storage } from "@plasmohq/storage"

const storage = new Storage()

chrome.runtime.onInstalled.addListener(async () => {
  await storage.set("activeTabIds", [])
})

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    const isActive = await storage.get(`tab_${tabId}_active`)
    if (isActive) {
      chrome.tabs.sendMessage(tabId, {
        action: "toggleTailware",
        isActive: true
      })
    }
  }
})

chrome.tabs.onRemoved.addListener(async (tabId) => {
  await storage.remove(`tab_${tabId}_active`)
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggleTailware") {
    const tabId = sender.tab?.id
    if (tabId) {
      storage.set(`tab_${tabId}_active`, request.isActive)
    }
  }
})
