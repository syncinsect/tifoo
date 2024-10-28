const activeTabsMap = new Map<number, boolean>();

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    const isActive = activeTabsMap.get(tabId);
    if (isActive) {
      chrome.tabs.sendMessage(tabId, {
        action: "toggleTailware",
        isActive: true,
      });
    }
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  activeTabsMap.delete(tabId);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const tabId = sender.tab?.id;

  switch (message.action) {
    case "toggleTailware":
      if (tabId) {
        activeTabsMap.set(tabId, message.isActive);
        sendResponse({ success: true });
      }
      break;

    case "getState":
      if (tabId) {
        sendResponse({ isActive: activeTabsMap.get(tabId) || false });
      }
      break;

    case "getCurrentTab":
      chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        sendResponse(tab);
      });
      return true;
  }
});
