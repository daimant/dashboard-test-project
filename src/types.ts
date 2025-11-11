export interface Variation {
  id?: number;
  name: string;
}

export interface DataPoint {
  date: string;
  visits: Record<string, number>;
  conversions: Record<string, number>;
}

export interface ChartDataPoint {
  date: string;

  [key: string]: string | number;
}

export interface DashboardData {
  variations: Variation[];
  data: DataPoint[];
}

export type TimeRange = "day" | "week";
export type LineStyle = "line" | "smooth" | "area";
export type Theme = "light" | "dark";

export interface ChartConfig {
  selectedVariations: string[];
  timeRange: TimeRange;
  lineStyle: LineStyle;
  theme: Theme;
  isZoomed: boolean;
  useSelectControls: boolean;
}

interface TooltipPayload {
  dataKey: string;
  value: number;
  color: string;
}

export interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
  theme: "light" | "dark";
  timeRange: "day" | "week";
  variations: Map<string, { name: string; color: string }>;
}


export interface CursorProps {
  points?: Array<{ x: number; y: number }>;
  height?: number;
}

export interface LineChartProps {
  data: ChartDataPoint[];
  selectedVariations: Map<string, { name: string; color: string }>;
  lineStyle: LineStyle;
  theme: Theme;
  timeRange: "day" | "week";
  yDomain: [number, number];
}

export interface ControlsProps {
  variations: Array<{ id: string; name: string; color: string }>;
  selectedVariations: string[];
  onVariationToggle: (id: string) => void;
  onVariationSetMultiple: (ids: string[]) => void;
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
  lineStyle: LineStyle;
  onLineStyleChange: (style: LineStyle) => void;
  theme: Theme;
  onThemeToggle: () => void;
  onExport: () => void;
  onShuffle: () => void;
  useSelectControls: boolean;
  onToggleSelectControls: () => void;
}