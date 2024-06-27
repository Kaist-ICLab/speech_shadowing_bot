import React, { useRef } from "react";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";

interface LevelChartProps {
  levels: number[];
  sx: { width: string; height: string };
}

const LevelChart: React.FC<LevelChartProps> = ({ levels, sx }) => {
  Chart.register(...registerables);
  const chartRef = useRef<Chart<"line", number[], string> | null>(null);
  const chartContainerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: sx.width,
    height: sx.height,
  };

  const data = {
    labels: levels.map((_, index) => `Lesson ${index + 1}`),
    datasets: [
      {
        label: "Level Progress",
        data: levels,
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };

  const options = {
    maintainAspectRatio: false,
    scales: {
      y: {
        min: 1,
        max: 10,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <div style={chartContainerStyle}>
      <Line ref={chartRef} data={data} options={options} />
    </div>
  );
};

export default LevelChart;
