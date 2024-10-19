// src/components/Toast.tsx
import React, { useEffect } from "react"

interface ToastProps {
  message: string
  onClose: () => void
}

const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 3000)

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-md text-sm z-[10002]">
      {message}
    </div>
  )
}

export default Toast
