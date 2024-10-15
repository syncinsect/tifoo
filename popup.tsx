import { useEffect, useState } from "react"

import "./style.css"

function IndexPopup() {
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
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
    <div className="popup">
      <h1>Tailware</h1>
      <div className="toggle">
        <span>Now is {isActive ? "active" : "inactive"}</span>
        <label className="switch">
          <input
            type="checkbox"
            checked={isActive}
            onChange={() => setIsActive(!isActive)}
          />
          <span className="slider round"></span>
        </label>
      </div>
    </div>
  )
}

export default IndexPopup
