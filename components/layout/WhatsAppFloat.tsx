"use client";

import React, { useState } from "react";

export const WhatsAppFloat: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState(false);
  const whatsappNumber = "2347012425718"; // Mock WhatsApp line

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <a
        href={`https://wa.me/${whatsappNumber}?text=Hello%20Nexplumb%20Support`}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full shadow-modal flex items-center justify-center text-white transform hover:scale-110 active:scale-95 transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal focus-visible:outline-offset-2"
        aria-label="Contact support on WhatsApp"
      >
        {/* WhatsApp SVG Icon */}
        <svg
          className="w-7 h-7 fill-current"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.45L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.97C16.528 2.017 14.077 1 11.533 1c-5.445 0-9.87 4.373-9.874 9.802-.001 1.739.486 3.438 1.411 4.937l-.989 3.613 3.734-.967c1.503.82 3.102 1.246 4.796 1.247h.046zM17.5 14.18c-.3-.15-1.782-.876-2.057-.976-.275-.1-.476-.15-.675.15-.2.3-.775.976-.95 1.176-.175.2-.35.225-.65.075-.3-.15-1.267-.467-2.413-1.485-.892-.793-1.493-1.771-1.668-2.07-.175-.3-.018-.462.13-.61.135-.133.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.675-1.625-.925-2.225-.244-.589-.48-.51-.66-.52-.18-.01-.385-.012-.59-.012-.205 0-.538.077-.82.388-.282.312-1.077 1.05-1.077 2.562 0 1.513 1.1 2.978 1.25 3.178.15.2 2.165 3.307 5.244 4.639.733.317 1.305.507 1.75.65.736.233 1.407.2 1.937.12.59-.09 1.782-.727 2.032-1.43.25-.7.25-1.3.175-1.43-.075-.13-.275-.205-.575-.355z" />
        </svg>
      </a>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute right-full bottom-3 mr-3 w-40 p-2.5 bg-navy text-white text-[11px] font-mono rounded shadow-modal z-50 text-center leading-normal">
          <div className="absolute top-1/2 left-full -translate-y-1/2 border-4 border-transparent border-l-navy" />
          <p className="font-bold">Need help?</p>
          <p className="opacity-90 mt-0.5">Chat with us on WhatsApp</p>
        </div>
      )}
    </div>
  );
};
export default WhatsAppFloat;
