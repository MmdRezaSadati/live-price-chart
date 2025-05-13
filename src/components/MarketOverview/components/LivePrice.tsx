import { useEffect, useState } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';

export const LivePrice = () => {
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [priceChange, setPriceChange] = useState<"up" | "down" | null>(null);
  const [previousPrice, setPreviousPrice] = useState<number | null>(null);

  const handlePriceUpdate = (price: number) => {
    setPreviousPrice(currentPrice);
    setCurrentPrice(price);
    
    if (previousPrice !== null) {
      setPriceChange(
        price > previousPrice ? "up" : price < previousPrice ? "down" : null
      );
    }
  };

  const { isLoading } = useWebSocket({ onPriceUpdate: handlePriceUpdate });

  if (isLoading) {
    return <div className="text-gray-500">Loading...</div>;
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-2xl font-bold gradient-text">
        ${currentPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
      </span>
      {priceChange && (
        <span
          className={`text-sm ${
            priceChange === "up" ? "text-green-500" : "text-red-500"
          }`}
        >
          {priceChange === "up" ? "↑" : "↓"}
        </span>
      )}
    </div>
  );
}; 