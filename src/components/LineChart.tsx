import React, { useRef } from "react";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import type { CursorProps, LineChartProps } from "../types";
import { formatDate } from "../utils/dataProcessing";
import CustomTooltip from "./CustomTooltip";
import styles from "./LineChart.module.scss";

const LineChartComponent: React.FC<LineChartProps> = ({
                                                        data,
                                                        selectedVariations,
                                                        lineStyle,
                                                        theme,
                                                        timeRange,
                                                        yDomain,
                                                      }) => {
  const chartRef = useRef<HTMLDivElement | null>(null);

  const strokeDasharray = lineStyle === "line" ? "0" : undefined;
  const curveType = lineStyle === "smooth" ? "monotone" : "linear";

  const CustomCursor = (props: CursorProps) => {
    const { points, height } = props;
    if (!points || points.length === 0) return null;

    const { x } = points[0];
    return (
      <line
        x1={x}
        y1={0}
        x2={x}
        y2={height}
        stroke={theme === "dark" ? "#666" : "#ccc"}
        strokeWidth={1}
        strokeDasharray="4 4"
      />
    );
  };

  const formatXAxis = (value: string) => {
    return formatDate(value, timeRange);
  };

  const formatYAxis = (value: number) => {
    return `${value.toFixed(0)}%`;
  };

  const ChartComponent = lineStyle === "area" ? AreaChart : RechartsLineChart;

  return (
    <div className={styles.chartContainer} ref={chartRef}>
      <ResponsiveContainer width="100%" height="100%">
        <ChartComponent data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={theme === "dark" ? "#333" : "#e0e0e0"}
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tickFormatter={formatXAxis}
            stroke={theme === "dark" ? "#999" : "#666"}
            style={{ fontSize: "12px" }}
            tick={{ fill: theme === "dark" ? "#999" : "#666" }}
            interval={1}
          />
          <YAxis
            domain={yDomain}
            tickFormatter={formatYAxis}
            stroke={theme === "dark" ? "#999" : "#666"}
            style={{ fontSize: "12px" }}
            tick={{ fill: theme === "dark" ? "#999" : "#666" }}
          />
          <Tooltip
            content={
              <CustomTooltip
                theme={theme}
                timeRange={timeRange}
                variations={selectedVariations}
              />
            }
            cursor={<CustomCursor/>}
          />

          {Array.from(selectedVariations.entries()).map(
            ([varId, { name, color }]) => {
              const dataKey = `var_${varId}`;

              if (lineStyle === "area") {
                return (
                  <Area
                    key={varId}
                    type={curveType}
                    dataKey={dataKey}
                    stroke={color}
                    fill={color}
                    fillOpacity={0.3}
                    strokeWidth={2}
                    name={name}
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                );
              }

              return (
                <Line
                  key={varId}
                  type={curveType}
                  dataKey={dataKey}
                  stroke={color}
                  strokeWidth={2}
                  name={name}
                  dot={false}
                  activeDot={{ r: 5 }}
                  strokeDasharray={strokeDasharray}
                />
              );
            },
          )}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChartComponent;
