import React, { useEffect, useState } from "react"

import "@/styles/globals.css"

function IndexPopup() {
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: "getState" },
          (response) => {
            if (response && response.isActive !== undefined) {
              setIsActive(response.isActive)
            }
          }
        )
      }
    })
  }, [])

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "toggleTailware",
          isActive
        })
      }
    })
  }, [isActive])

  const handleToggle = () => {
    setIsActive(!isActive)
    setTimeout(() => {
      window.close()
    }, 500)
  }

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "updatePopupState") {
      updatePopupUI(request.isActive)
    }
  })

  function updatePopupUI(isActive: boolean) {
    const statusElement = document.getElementById("status")
    const toggleButton = document.getElementById("toggleButton")

    if (statusElement) {
      statusElement.textContent = isActive ? "Active" : "Inactive"
      statusElement.style.color = isActive ? "green" : "red"
    }

    if (toggleButton) {
      toggleButton.textContent = isActive ? "Deactivate" : "Activate"
    }
  }

  chrome.runtime.sendMessage({ action: "getState" }, (response) => {
    if (response && response.isActive !== undefined) {
      updatePopupUI(response.isActive)
    }
  })

  return (
    <div className="w-80 bg-white shadow-lg overflow-hidden">
      <div className="bg-[#1DA1F2] text-white p-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-righteous">Tailware</h1>
        </div>
        <div className="flex items-center space-x-2">
          <span
            className={`w-3 h-3 rounded-full ${isActive ? "bg-green-400" : "bg-gray-400"}`}></span>
          <span className="text-sm font-medium">
            {isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </div>
      <div className="p-4 space-y-4">
        <p className="text-[#657786] text-sm">
          Tailwind CSS inspector and editor
        </p>
        <button
          className={`w-full py-2 px-4 rounded-full text-white font-medium transition-all duration-300 ${
            isActive
              ? "bg-red-500 hover:bg-red-600"
              : "bg-[#1DA1F2] hover:bg-[#0C7ABF]"
          } hover:shadow-md transform hover:-translate-y-0.5`}
          onClick={handleToggle}>
          {isActive ? "Deactivate" : "Activate"}
        </button>
      </div>
      <div className="bg-[#E8F5FE] p-3 flex justify-between text-xs text-[#657786]">
        <a
          href={process.env.PLASMO_PUBLIC_GITHUB_REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-[#1DA1F2] transition-colors duration-300">
          Learn more
        </a>
        <a
          href={process.env.PLASMO_PUBLIC_GITHUB_ISSUES_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-[#1DA1F2] transition-colors duration-300">
          Report an issue
        </a>
      </div>
    </div>
  )
}

export default IndexPopup
