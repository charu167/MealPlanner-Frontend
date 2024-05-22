import React from "react";

// Interface defining the props for MacroCircle
interface MacroCircleProps {
  type: string; // The name of the nutrient (Protein, Fats, Carbohydrates)
  current: number; // Current amount consumed or utilized
  total: number; // Total amount needed or targeted
  color: string; // Color for the progress circle
}

// MacroCircle component to display individual macro nutrient details
const MacroCircle: React.FC<MacroCircleProps> = ({
  type,
  current,
  total,
  color,
}) => {
  const percent = (current / total) * 100; // Calculate the percentage of nutrient consumed

  // Styles for the progress ring
  const circleStyle = {
    background: `conic-gradient(${color} ${percent}%, transparent ${percent}% 100%)`,
  };

  return (
    <div className="macro-circle">
      <div className="progress-circle" style={circleStyle}>
        <div className="progress-inner-circle">
          <span>{`${current.toFixed(0)}g / ${total.toFixed(0)}g`}</span>
        </div>
      </div>
      <p className="macro-type">{type}</p>
    </div>
  );
};

export default MacroCircle;
