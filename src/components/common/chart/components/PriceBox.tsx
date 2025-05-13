import styles from "../LivePriceChart.module.css";

interface PriceBoxProps {
  currentPrice: number;
  priceChange: "up" | "down" | null;
}

export const PriceBox = ({ currentPrice, priceChange }: PriceBoxProps) => {
  return (
    <div
      className={`${styles.priceBox} ${
        priceChange === "up"
          ? styles.up
          : priceChange === "down"
          ? styles.down
          : styles.neutral
      }`}
    >
      ${currentPrice?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
    </div>
  );
}; 