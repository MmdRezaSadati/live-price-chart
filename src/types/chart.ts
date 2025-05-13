export interface ChartHeaderProps {
  price: number;
  priceColor: string;
  glowColor: string;
  priceChange: number;
  priceChangeValue: number;
  isPositiveChange: boolean;
  fontSize: {
    title: number;
    price: number;
    small: number;
  };
  iconSize: number;
  padding: {
    x: number;
    y: number;
  };
  headerHeight: number;
} 