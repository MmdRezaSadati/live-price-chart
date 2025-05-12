"use client";

import React from 'react';
import { ChartHeader } from './ChartHeader';

interface RefreshHandlerProps {
  title: string;
  description: string;
  isLive: boolean;
}

export const RefreshHandler: React.FC<RefreshHandlerProps> = ({
  title,
  description,
  isLive
}) => {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <ChartHeader
      title={title}
      description={description}
      isLive={isLive}
      onRefresh={handleRefresh}
    />
  );
}; 