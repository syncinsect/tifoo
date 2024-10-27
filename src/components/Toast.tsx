import type { ToastProps } from "@/types";
import React, { useEffect } from "react";

const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 bg-[#1DA1F2] text-white px-4 py-2 rounded-full text-sm z-[10002] shadow-lg flex items-center">
      <svg
        className="w-4 h-4 mr-2 fill-current"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
      </svg>
      <span>{message}</span>
    </div>
  );
};

export default Toast;
