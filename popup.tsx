import React, { useEffect, useState } from "react";
import "@/styles";

function IndexPopup() {
  const [isActive, setIsActive] = useState(false);

  const sendMessageToActiveTab = async (message: any) => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab.id) {
      return chrome.tabs.sendMessage(tab.id, message);
    }
  };

  useEffect(() => {
    const initState = async () => {
      try {
        const response = await sendMessageToActiveTab({ action: "getState" });
        if (response?.isActive !== undefined) {
          setIsActive(response.isActive);
        }
      } catch (error) {
        console.error("Failed to get initial state:", error);
      }
    };

    initState();
  }, []);

  const handleToggle = async () => {
    try {
      const newState = !isActive;
      await sendMessageToActiveTab({
        action: "toggleTifoo",
        isActive: newState,
      });
      setIsActive(newState);
      setTimeout(() => {
        window.close();
      }, 500);
    } catch (error) {
      console.error("Failed to toggle state:", error);
    }
  };

  return (
    <div data-tifoo-ext>
      <div className="w-80">
        <div className="bg-[#1DA1F2] text-white p-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className={`font-caprasimo text-xl`}>tifoo</span>
          </div>
          <div className="flex items-center space-x-2">
            <span
              className={`w-3 h-3 rounded-full ${isActive ? "bg-green-400" : "bg-gray-400"}`}
            ></span>
            <span className="text-sm font-mono">
              {isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
        <div className="p-4 space-y-4">
          <p className="text-[#657786] text-sm font-mono text-center">
            Effortless Tailwind Stylings, Now!
          </p>
          <button
            className={`w-full py-2 px-4 rounded-full text-white font-medium transition-all duration-300 ${
              isActive
                ? "bg-red-500 hover:bg-red-600"
                : "bg-[#1DA1F2] hover:bg-[#0C7ABF]"
            } hover:shadow-md transform hover:-translate-y-0.5`}
            onClick={handleToggle}
          >
            {isActive ? "Deactivate" : "Activate"}
          </button>
        </div>
        <div className="bg-[#E8F5FE] p-3 flex justify-between text-xs text-[#657786]">
          <a
            href={process.env.PLASMO_PUBLIC_GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#1DA1F2] transition-colors duration-300"
          >
            Learn more
          </a>
          <a
            href={process.env.PLASMO_PUBLIC_GITHUB_ISSUES_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#1DA1F2] transition-colors duration-300"
          >
            Report an issue
          </a>
        </div>
      </div>
    </div>
  );
}

export default IndexPopup;
