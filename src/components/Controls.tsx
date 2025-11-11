import React from "react";
import type { TimeRange, LineStyle, ControlsProps } from "../types";
import styles from "./Controls.module.scss";

const Controls: React.FC<ControlsProps> = ({
                                             variations,
                                             selectedVariations,
                                             onVariationToggle,
                                             onVariationSetMultiple,
                                             timeRange,
                                             onTimeRangeChange,
                                             lineStyle,
                                             onLineStyleChange,
                                             theme,
                                             onThemeToggle,
                                             onExport,
                                             onShuffle,
                                             useSelectControls,
                                             onToggleSelectControls,
                                           }) => {
  const handleVariationClick = (id: string) => {
    if (selectedVariations.includes(id) && selectedVariations.length === 1) return;
    onVariationToggle(id);
  };

  const handleVariationSelectChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(
      (option) => option.value,
    );
    if (selectedOptions.length === 0) return;
    onVariationSetMultiple(selectedOptions);
  };

  return (
    <div className={styles.controls}>
      <div className={styles.controlGroup}>
        <label className={styles.label}>
          Variations
          {useSelectControls && (
            <span
              style={{
                fontSize: "11px",
                fontWeight: "normal",
                marginLeft: "8px",
                opacity: 0.7,
              }}
            >
              (Hold Cmd for multiple)
            </span>
          )}
        </label>
        {useSelectControls ? (
          <select
            className={styles.select}
            multiple
            value={Array.from(selectedVariations)}
            onChange={handleVariationSelectChange}
            size={Math.min(variations.length, 4)}
            title="Hold Cmd to select multiple variations"
          >
            {variations.map((variation) => (
              <option key={variation.id} value={variation.id}>{variation.name}</option>
            ))}
          </select>
        ) : (
          <div className={styles.variationsGrid}>
            {variations.map((variation) => {
              const isSelected = selectedVariations.includes(variation.id);
              const isOnlySelected = isSelected && selectedVariations.length === 1;

              return (
                <button
                  key={variation.id}
                  className={`
                    ${styles.variationButton} 
                    ${isSelected ? styles.active : ""} 
                    ${isOnlySelected ? styles.disabled : ""}
                  `}
                  onClick={() => handleVariationClick(variation.id)}
                  disabled={isOnlySelected}
                  style={{ borderColor: isSelected ? variation.color : undefined, }}
                >
                  <span
                    className={styles.colorIndicator}
                    style={{ backgroundColor: variation.color }}
                  />
                  {variation.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className={styles.controlGroup}>
        <label className={styles.label}>Time Range</label>
        {useSelectControls ? (
          <select
            className={styles.select}
            value={timeRange}
            onChange={(e) => onTimeRangeChange(e.target.value as TimeRange)}
          >
            <option value="day">Day</option>
            <option value="week">Week</option>
          </select>
        ) : (
          <div className={styles.buttonGroup}>
            <button
              className={`${styles.button} ${timeRange === "day" ? styles.active : ""}`}
              onClick={() => onTimeRangeChange("day")}
            >
              Day
            </button>
            <button
              className={`${styles.button} ${timeRange === "week" ? styles.active : ""}`}
              onClick={() => onTimeRangeChange("week")}
            >
              Week
            </button>
          </div>
        )}
      </div>

      <div className={styles.controlGroup}>
        <label className={styles.label}>Line Style</label>
        {useSelectControls ? (
          <select
            className={styles.select}
            value={lineStyle}
            onChange={(e) => onLineStyleChange(e.target.value as LineStyle)}
          >
            <option value="line">Line</option>
            <option value="smooth">Smooth</option>
            <option value="area">Area</option>
          </select>
        ) : (
          <div className={styles.buttonGroup}>
            <button
              className={`${styles.button} ${lineStyle === "line" ? styles.active : ""}`}
              onClick={() => onLineStyleChange("line")}
            >
              Line
            </button>
            <button
              className={`${styles.button} ${lineStyle === "smooth" ? styles.active : ""}`}
              onClick={() => onLineStyleChange("smooth")}
            >
              Smooth
            </button>
            <button
              className={`${styles.button} ${lineStyle === "area" ? styles.active : ""}`}
              onClick={() => onLineStyleChange("area")}
            >
              Area
            </button>
          </div>
        )}
      </div>

      <div className={styles.controlGroup}>
        <label className={styles.label}>Actions</label>
        <div className={`${styles.buttonGroup} ${styles.actions}`}>
          <button
            className={styles.button}
            onClick={onThemeToggle}
            title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
          >
            {theme === "light" ? "🌙" : "☀️"} Theme
          </button>
          <button
            className={styles.button}
            onClick={onToggleSelectControls}
            title="Toggle between buttons and selects"
          >
            {useSelectControls ? "🔘" : "📋"} Controls
          </button>
          <button
            className={styles.button}
            onClick={onShuffle}
            title="Shuffle data"
          >
            🔀 Shuffle
          </button>
          <button
            className={styles.button}
            onClick={onExport}
            title="Export chart as PNG"
          >
            📥 Export
          </button>
        </div>
      </div>
    </div>
  );
};

export default Controls;
