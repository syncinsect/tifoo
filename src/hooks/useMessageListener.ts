import { useEffect } from "react";

export const useMessageListener = (
  setIsActive: (isActive: boolean) => void,
  isActive: boolean,
  resetAllState: () => void,
  resetTailwareState: () => void,
  resetClassManagement: () => void
) => {
  useEffect(() => {
    const handleMessage = (request: any, sender: any, sendResponse: any) => {
      if (request.action === "toggleTailware") {
        setIsActive(request.isActive);

        if (!request.isActive) {
          resetAllState();
          resetTailwareState();
          resetClassManagement();
        }
      } else if (request.action === "getState") {
        sendResponse({ isActive });
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, [
    setIsActive,
    isActive,
    resetAllState,
    resetTailwareState,
    resetClassManagement,
  ]);
};
