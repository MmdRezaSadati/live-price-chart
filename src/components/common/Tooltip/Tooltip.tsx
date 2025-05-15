import styles from "@/assets/styles/LivePriceChart.module.css";

interface TooltipProps {
  x: number;
  y: number;
  value: number;
}

export const Tooltip = ({ x, y, value }: TooltipProps) => {
  return (
    <div
      className={styles.tooltip}
      style={{ left: x, top: y }}
    >
      ${value.toLocaleString(undefined, {
        maximumFractionDigits: 2,
      })}
    </div>
  );
}; 