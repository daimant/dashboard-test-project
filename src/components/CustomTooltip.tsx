import React from "react";
import { formatPercentage, formatDate } from "../utils/dataProcessing";
import styles from "./CustomTooltip.module.scss";
import type { CustomTooltipProps } from "../types.ts";

const CustomTooltip: React.FC<CustomTooltipProps> = ({
                                                       active,
                                                       payload,
                                                       label,
                                                       theme,
                                                       timeRange,
                                                       variations,
                                                     }) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className={`${styles.tooltip} ${theme === "dark" ? styles.dark : styles.light}`}>
      <div className={styles.tooltipHeader}>
        {label && formatDate(label, timeRange)}
      </div>
      <div className={styles.tooltipContent}>
        {payload.map((entry, index) => {
          const varId = entry.dataKey.replace("var_", "");
          const varInfo = variations.get(varId);

          if (!varInfo) return null;

          return (
            <div key={index} className={styles.tooltipRow}>
              <span
                className={styles.colorDot}
                style={{ backgroundColor: entry.color }}
              />
              <span className={styles.varName}>{varInfo.name}:</span>
              <span className={styles.value}>
                {formatPercentage(entry.value)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CustomTooltip;
