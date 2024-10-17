import React, { useEffect, useState } from "react"

import { Storage } from "@plasmohq/storage"

import "./style.css"

const storage = new Storage()

function IndexPopup() {
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    storage.get("isActive").then((value) => {
      setIsActive(Boolean(value))
    })
  }, [])

  useEffect(() => {
    storage.set("isActive", isActive)
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "toggleScanner",
          isActive
        })
      }
    })
  }, [isActive])

  return (
    <div
      className={`w-80 ${isActive ? "bg-blue-50" : "bg-white"} transition-colors duration-300`}>
      <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold">tailware</h1>
        <div className="flex items-center">
          <span
            className={`w-2 h-2 rounded-full mr-2 ${isActive ? "bg-green-500" : "bg-gray-400"} transition-colors duration-300`}></span>
          <span className="text-sm">{isActive ? "Active" : "Inactive"}</span>
        </div>
      </div>
      <div className="p-4">
        <p className="text-gray-600 mb-4">Tailwind CSS inspector and editor</p>
        <button
          className={`w-full py-2 px-4 rounded-lg text-white font-medium transition-all duration-300 ${
            isActive
              ? "bg-green-500 hover:bg-green-600"
              : "bg-blue-500 hover:bg-blue-600"
          } hover:shadow-md transform hover:-translate-y-0.5`}
          onClick={() => setIsActive(!isActive)}>
          {isActive ? "Deactivate" : "Activate"}
        </button>
      </div>
      <div className="bg-gray-100 p-3 flex justify-between text-xs text-gray-500">
        <a
          href="https://github.com/actopas/tailware"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-blue-500 transition-colors duration-300">
          Learn more
        </a>
        <a
          href="https://github.com/actopas/tailware/issues/new"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-blue-500 transition-colors duration-300">
          Report an issue
        </a>
      </div>
    </div>
  )
}

export default IndexPopup
