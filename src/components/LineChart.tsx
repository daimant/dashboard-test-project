import React, { useRef, useState } from "react";
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
  ReferenceArea,
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
                                                        isZoomed,
                                                      }) => {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const [refAreaLeft, setRefAreaLeft] = useState<string | null>(null);
  const [refAreaRight, setRefAreaRight] = useState<string | null>(null);
  const [zoomDomain, setZoomDomain] = useState<{
    left: string | null;
    right: string | null;
  }>({ left: null, right: null });

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

  const handleMouseDown = (e: { activeLabel?: string } | null) => {
    if (!isZoomed || !e || !e.activeLabel) return;
    setRefAreaLeft(e.activeLabel);
  };

  const handleMouseMove = (e: { activeLabel?: string } | null) => {
    if (!isZoomed || !refAreaLeft || !e || !e.activeLabel) return;
    setRefAreaRight(e.activeLabel);
  };

  const handleMouseUp = () => {
    if (!isZoomed || !refAreaLeft || !refAreaRight) {
      setRefAreaLeft(null);
      setRefAreaRight(null);
      return;
    }

    const leftIndex = data.findIndex((d) => d.date === refAreaLeft);
    const rightIndex = data.findIndex((d) => d.date === refAreaRight);

    if (leftIndex === -1 || rightIndex === -1) {
      setRefAreaLeft(null);
      setRefAreaRight(null);
      return;
    }

    const [left, right] =
      leftIndex <= rightIndex
        ? [refAreaLeft, refAreaRight]
        : [refAreaRight, refAreaLeft];

    setZoomDomain({ left, right });
    setRefAreaLeft(null);
    setRefAreaRight(null);
  };

  const handleDoubleClick = () => {
    if (!isZoomed) return;
    setZoomDomain({ left: null, right: null });
    setRefAreaLeft(null);
    setRefAreaRight(null);
  };

  const displayData =
    zoomDomain.left && zoomDomain.right
      ? data.filter((item) => {
        const leftIndex = data.findIndex((d) => d.date === zoomDomain.left);
        const rightIndex = data.findIndex((d) => d.date === zoomDomain.right);
        const currentIndex = data.findIndex((d) => d.date === item.date);
        return currentIndex >= leftIndex && currentIndex <= rightIndex;
      })
      : data;

  React.useEffect(() => {
    if (!isZoomed) {
      setZoomDomain({ left: null, right: null });
      setRefAreaLeft(null);
      setRefAreaRight(null);
    }
  }, [isZoomed]);

  return (
    <div
      className={`${styles.chartContainer} ${isZoomed ? styles.zoomEnabled : ""}`}
      ref={chartRef}
    >
      {isZoomed && (
        <div className={styles.zoomIndicator}>
          {zoomDomain.left && zoomDomain.right
            ? "Double-click to reset zoom"
            : "Click and drag to zoom"}
        </div>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <ChartComponent
          data={displayData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onDoubleClick={handleDoubleClick}
        >
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
            interval={timeRange === 'week' ? undefined : 1}
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

          {refAreaLeft && refAreaRight && (
            <ReferenceArea
              x1={refAreaLeft}
              x2={refAreaRight}
              strokeOpacity={0.3}
              fill={theme === "dark" ? "#666" : "#ccc"}
              fillOpacity={0.3}
            />
          )}

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
