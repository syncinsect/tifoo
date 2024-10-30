import type { ToastProps, ToastType } from "@/types";
import React from "react";

const Toast: React.FC<ToastProps> = ({ message, type = "success" }) => {
  const bgColorMap: Record<ToastType, string> = {
    success: "bg-[#1DA1F2]",
    warning: "bg-[#F59E0B]",
    error: "bg-[#EF4444]",
  };

  return (
    <div
      className={`
        fixed bottom-5 left-1/2 transform -translate-x-1/2 
        ${bgColorMap[type]} text-white px-4 py-2 rounded-full text-sm 
        z-[10002] shadow-lg flex items-center
        opacity-0 translate-y-2
        animate-[fadeIn_0.3s_ease-in-out_forwards,fadeOut_0.3s_ease-in-out_2.5s_forwards]
      `}
    >
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
