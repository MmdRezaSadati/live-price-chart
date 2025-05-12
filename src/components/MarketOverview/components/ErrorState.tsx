"use client";

import React from 'react';

export const ErrorState: React.FC = () => {
  return (
    <div className="text-red-500 p-4 text-center">
      Error loading market data. Please try again later.
    </div>
  );
}; 