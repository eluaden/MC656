"use client";

import React, { useState } from "react";

interface AccordionProps {
  id: string;
  title: string;
  description?: string;
  isDefaultOpen?: boolean;
  children: React.ReactNode;
}

export function Accordion({
  id,
  title,
  description,
  isDefaultOpen = true,
  children,
}: AccordionProps) {
  const [isOpen, setIsOpen] = useState(isDefaultOpen);

  return (
    <div className="border border-white/20 rounded-lg overflow-hidden bg-white/5 hover:bg-white/10 transition-all">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between bg-gradient-to-r from-white/5 to-transparent hover:from-white/10 transition-all"
      >
        <div className="flex flex-col items-start gap-1">
          <h3 className="font-semibold text-white">{title}</h3>
          {description && (
            <p className="text-xs text-gray-400">{description}</p>
          )}
        </div>
        <div
          className={`transition-transform transform ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <svg
            className="w-5 h-5 text-emerald-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="px-4 py-4 border-t border-white/10 bg-white/3">
          {children}
        </div>
      )}
    </div>
  );
}
