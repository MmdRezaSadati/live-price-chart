import { SpringValue, animated } from "@react-spring/web";

interface PricePathAreaProps {
  areaPath: SpringValue<string>;
  fillColor: string;
}

export const PricePathArea = ({ areaPath, fillColor }: PricePathAreaProps) => {
  return (
    <animated.path
      d={areaPath}
      fill={fillColor}
      fillOpacity={0.1}
      stroke="none"
    />
  );
}; 