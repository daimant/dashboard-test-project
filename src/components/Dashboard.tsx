import React, { useState, useMemo, useRef } from "react";
import LineChartComponent from "./LineChart";
import Controls from "./Controls";
import type { ChartConfig, TimeRange, LineStyle, Theme } from "../types";
import {
  processChartData,
  getChartDomain,
  exportChartToPNG,
  shuffleData,
  getVariationId
} from "../utils/dataProcessing";
import rawDashboardData from "../../public/data.json";
import type { DashboardData } from "../types";
import styles from "./Dashboard.module.scss";

const initialDashboardData = rawDashboardData as DashboardData;

const VARIATION_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData>(initialDashboardData);

  const variations = useMemo(() => {
    return dashboardData.variations.map((variation, index) => ({
      id: getVariationId(variation),
      name: variation.name,
      color: VARIATION_COLORS[index % VARIATION_COLORS.length],
    }));
  }, [dashboardData]);

  const [config, setConfig] = useState<ChartConfig>({
    selectedVariations: variations.map(el => el.id),
    timeRange: "day" as TimeRange,
    lineStyle: "smooth" as LineStyle,
    theme: "dark" as Theme,
    isZoomed: false,
    useSelectControls: false,
  });

  const chartRef = useRef<HTMLDivElement | null>(null);

  const handleVariationToggle = (id: string) => {
    setConfig((prev) => {
      let newSelected = prev.selectedVariations;

      if (newSelected.includes(id)) {
        if (newSelected.length > 1) newSelected = newSelected.filter(el => el !== id);
      } else newSelected = [...newSelected, id];

      return { ...prev, selectedVariations: newSelected };
    });
  };

  const handleVariationSetMultiple = (ids: string[]) => {
    if (ids.length === 0) return;
    setConfig((prev) => ({ ...prev, selectedVariations: ids, }));
  };

  const handleTimeRangeChange = (range: TimeRange) => {
    setConfig((prev) => ({ ...prev, timeRange: range }));
  };

  const handleLineStyleChange = (style: LineStyle) => {
    setConfig((prev) => ({ ...prev, lineStyle: style }));
  };

  const handleThemeToggle = () => {
    setConfig((prev) => ({ ...prev, theme: prev.theme === "light" ? "dark" : "light", }));
  };

  const handleExport = async () => {
    await exportChartToPNG(chartRef.current, "dashboard-chart.png");
  };

  const handleShuffle = () => {
    setDashboardData(shuffleData(dashboardData));
  };

  const handleToggleSelectControls = () => {
    setConfig((prev) => ({
      ...prev,
      useSelectControls: !prev.useSelectControls,
    }));
  };

  const chartData = useMemo(() => {
    return processChartData(dashboardData.data, config.selectedVariations, config.timeRange);
  }, [dashboardData.data, config.selectedVariations, config.timeRange]);

  const yDomain = useMemo(() => {
    return getChartDomain(chartData, config.selectedVariations);
  }, [chartData, config.selectedVariations]);

  const selectedVariationsMap = useMemo(() => {
    const map = new Map<string, { name: string; color: string }>();

    variations.forEach((variation) => {
      if (config.selectedVariations.includes(variation.id)) {
        map.set(variation.id, { name: variation.name, color: variation.color });
      }
    });

    return map;
  }, [variations, config.selectedVariations]);

  return (
    <div className={`${styles.dashboard} ${config.theme === "dark" ? styles.dark : styles.light}`}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>A/B Test Analytics Dashboard</h1>
          <p className={styles.subtitle}>
            Interactive Conversion Rate Analysis
          </p>
        </header>

        <Controls
          variations={variations}
          selectedVariations={config.selectedVariations}
          onVariationToggle={handleVariationToggle}
          onVariationSetMultiple={handleVariationSetMultiple}
          timeRange={config.timeRange}
          onTimeRangeChange={handleTimeRangeChange}
          lineStyle={config.lineStyle}
          onLineStyleChange={handleLineStyleChange}
          theme={config.theme}
          onThemeToggle={handleThemeToggle}
          onExport={handleExport}
          onShuffle={handleShuffle}
          useSelectControls={config.useSelectControls}
          onToggleSelectControls={handleToggleSelectControls}
        />

        <div ref={chartRef}>
          <LineChartComponent
            data={chartData}
            selectedVariations={selectedVariationsMap}
            lineStyle={config.lineStyle}
            theme={config.theme}
            timeRange={config.timeRange}
            yDomain={yDomain}
          />
        </div>

        <footer className={styles.footer}>
          <p>Conversion Rate = (Conversions / Visits) × 100</p>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;
