
import React from 'react';

interface SliderProps {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Slider: React.FC<SliderProps> = ({ label, min, max, value, onChange }) => {
  return (
    <div className="flex flex-col space-y-2">
      <label htmlFor="speed-slider" className="text-sm font-medium text-slate-300">{label}</label>
      <input
        id="speed-slider"
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={onChange}
        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer range-lg accent-sky-500"
      />
    </div>
  );
};

export default Slider;
