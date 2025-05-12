"use client";

import React from 'react';

interface RefreshButtonProps {
  onRefresh: () => void;
}

export const RefreshButton: React.FC<RefreshButtonProps> = ({ onRefresh }) => {
  return (
    <button 
      onClick={onRefresh}
      className="px-4 py-2 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 border border-yellow-500/20 transition-all duration-300"
    >
      <span className="flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Refresh
      </span>
    </button>
  );
};
