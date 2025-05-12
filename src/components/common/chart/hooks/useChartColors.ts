import * as d3 from 'd3';

interface ChartColors {
  colors: {
    up: {
      primary: string;
      secondary: string;
      gradient: string;
      glow: string;
    };
    down: {
      primary: string;
      secondary: string;
      gradient: string;
      glow: string;
    };
    neutral: {
      primary: string;
      secondary: string;
      gradient: string;
      glow: string;
    };
  };
  createGradient: (defs: d3.Selection<SVGDefsElement, unknown, null, undefined>, id: string, color: string) => void;
}

export const useChartColors = (): ChartColors => {
  const colors = {
    up: {
      primary: "#00ff9d", // Bright neon green
      secondary: "#00cc7e",
      gradient: "#00ff9d",
      glow: "#00ff9d",
    },
    down: {
      primary: "#ff3d71", // Vibrant pink
      secondary: "#ff1f5a",
      gradient: "#ff3d71",
      glow: "#ff3d71",
    },
    neutral: {
      primary: "#7b61ff", // Electric purple
      secondary: "#5d4bff",
      gradient: "#7b61ff",
      glow: "#7b61ff",
    },
  };

  const createGradient = (
    defs: d3.Selection<SVGDefsElement, unknown, null, undefined>,
    id: string,
    color: string
  ) => {
    const gradient = defs
      .append("linearGradient")
      .attr("id", id)
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");

    // Enhanced gradient stops for more depth and visual interest
    gradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", color)
      .attr("stop-opacity", 0.8);

    gradient
      .append("stop")
      .attr("offset", "20%")
      .attr("stop-color", color)
      .attr("stop-opacity", 0.6);

    gradient
      .append("stop")
      .attr("offset", "40%")
      .attr("stop-color", color)
      .attr("stop-opacity", 0.4);

    gradient
      .append("stop")
      .attr("offset", "60%")
      .attr("stop-color", color)
      .attr("stop-opacity", 0.3);

    gradient
      .append("stop")
      .attr("offset", "80%")
      .attr("stop-color", color)
      .attr("stop-opacity", 0.2);

    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", color)
      .attr("stop-opacity", 0);
  };

  return {
    colors,
    createGradient
  };
}; 