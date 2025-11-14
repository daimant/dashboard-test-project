import html2canvas from "html2canvas";
import type {
  DataPoint,
  ChartDataPoint,
  DashboardData,
  TimeRange,
} from "../types";

export const calculateConversionRate = (
  conversions: number,
  visits: number,
): number => {
  if (visits === 0) return 0;
  return (conversions / visits) * 100;
};

export const getVariationId = (variation: {
  id?: number;
  name: string;
}): string => {
  return variation.id !== undefined ? variation.id.toString() : "0";
};

export const processChartData = (
  data: DataPoint[],
  selectedVariations: string[],
  timeRange: TimeRange,
): ChartDataPoint[] => {
  let processedData = [...data];

  if (timeRange === "week") {
    processedData = groupByWeek(data);
  }

  return processedData.map((point) => {
    const chartPoint: ChartDataPoint = {
      date: point.date,
    };

    selectedVariations.forEach((varId) => {
      const visits = point.visits[varId] || 0;
      const conversions = point.conversions[varId] || 0;
      chartPoint[`var_${varId}`] = calculateConversionRate(conversions, visits);
    });

    return chartPoint;
  });
};

const groupByWeek = (data: DataPoint[]): DataPoint[] => {
  const weeks: Map<string, DataPoint> = new Map();

  data.forEach((point) => {
    const date = new Date(point.date);
    const weekStart = getWeekStart(date);
    const weekKey = weekStart.toISOString().split("T")[0];

    if (!weeks.has(weekKey)) {
      weeks.set(weekKey, {
        date: weekKey,
        visits: {},
        conversions: {},
      });
    }

    const weekData = weeks.get(weekKey)!;

    Object.keys(point.visits).forEach((varId) => {
      weekData.visits[varId] = (weekData.visits[varId] || 0) + (point.visits[varId] || 0);
      weekData.conversions[varId] = (weekData.conversions[varId] || 0) + (point.conversions[varId] || 0);
    });
  });

  return Array.from(weeks.values()).sort((a, b) =>
    a.date.localeCompare(b.date),
  );
};

const getWeekStart = (date: Date): Date => {
  const d = date;
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday as first day
  return new Date(d.setDate(diff));
};

export const formatDate = (
  dateString: string,
  timeRange: TimeRange,
): string => {
  const date = new Date(dateString);

  if (timeRange === "week") {
    const weekEnd = date;
    weekEnd.setDate(weekEnd.getDate() + 6);

    const formatOptions: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
    };
    return `${date.toLocaleDateString("en-US", formatOptions)} - ${weekEnd.toLocaleDateString("en-US", formatOptions)}`;
  }

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(2)}%`;
};

export const getChartDomain = (
  data: ChartDataPoint[],
  selectedVariations: string[],
): [number, number] => {
  let min = Infinity;
  let max = -Infinity;

  data.forEach((point) => {
    selectedVariations.forEach((varId) => {
      const value = point[`var_${varId}`] as number;
      if (value !== undefined && !isNaN(value)) {
        min = Math.min(min, value);
        max = Math.max(max, value);
      }
    });
  });

  if (min === Infinity || max === -Infinity) {
    return [0, 100];
  }

  const padding = (max - min) * 0.1;
  return [Math.max(0, min - padding), Math.min(100, max + padding)];
};

export const exportChartToPNG = async (
  chartRef: HTMLElement | null,
  filename: string = "chart.png",
) => {
  if (!chartRef) return;

  try {
    const canvas = await html2canvas(chartRef, {
      backgroundColor: null,
      scale: 2,
    });

    const link = document.createElement("a");
    link.download = filename;
    link.href = canvas.toDataURL("image/png");
    link.click();
  } catch (error) {
    console.error("Error exporting chart:", error);
    alert("Failed to export chart. Please try again.");
  }
};

export const shuffleData = (data: DashboardData): DashboardData => {
  const originalData = data.data;
  const variationIds = new Set<string>();

  originalData.forEach((point) => {
    Object.keys(point.visits).forEach((id) => variationIds.add(id));
    Object.keys(point.conversions).forEach((id) => variationIds.add(id));
  });

  const varIdArray = Array.from(variationIds);
  const ranges: Record<
    string,
    {
      visitsMin: number;
      visitsMax: number;
      conversionsMin: number;
      conversionsMax: number;
    }
  > = {};

  varIdArray.forEach((varId) => {
    const visits: number[] = [];
    const conversions: number[] = [];

    originalData.forEach((point) => {
      if (point.visits[varId] !== undefined) {
        visits.push(point.visits[varId]);
      }
      if (point.conversions[varId] !== undefined) {
        conversions.push(point.conversions[varId]);
      }
    });

    ranges[varId] = {
      visitsMin: Math.min(...visits),
      visitsMax: Math.max(...visits),
      conversionsMin: Math.min(...conversions),
      conversionsMax: Math.max(...conversions),
    };
  });

  const shuffledData = originalData.map((point) => {
    const newVisits: Record<string, number> = {};
    const newConversions: Record<string, number> = {};

    Object.keys(point.visits).forEach((varId) => {
      const range = ranges[varId];
      newVisits[varId] = Math.floor(
        Math.random() * (range.visitsMax - range.visitsMin + 1) +
        range.visitsMin,
      );
    });

    Object.keys(point.conversions).forEach((varId) => {
      const range = ranges[varId];
      const maxConversions = Math.min(
        newVisits[varId] || 0,
        range.conversionsMax,
      );
      const minConversions = Math.min(range.conversionsMin, maxConversions);
      newConversions[varId] = Math.floor(
        Math.random() * (maxConversions - minConversions + 1) + minConversions,
      );
    });

    return {
      date: point.date,
      visits: newVisits,
      conversions: newConversions,
    };
  });

  return {
    ...data,
    data: shuffledData,
  };
};
