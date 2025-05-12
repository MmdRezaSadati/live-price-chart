"use client";

import React from 'react';

export const LoadingState: React.FC = () => {
  return (
    <div className="space-y-4">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="h-12 bg-gray-800/30 rounded-lg"></div>
        </div>
      ))}
    </div>
  );
}; 