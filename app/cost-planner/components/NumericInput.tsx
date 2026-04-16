import React from "react";

interface NumericInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  error?: string;
  suffix?: string;
}

export function NumericInput({
  label,
  value,
  onChange,
  placeholder,
  min = 0,
  max,
  step = 1,
  required = false,
  error,
  suffix,
}: NumericInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    let inputValue = e.target.value;

    if (inputValue === "") {
      onChange(0);
      return;
    }

    if (inputValue.startsWith("0") && inputValue.length > 1 && !inputValue.includes(".")) {
      inputValue = inputValue.replace(/^0+/, "");
      e.target.value = inputValue;
    }

    const numValue = parseFloat(inputValue);
    
    if (!isNaN(numValue)) {
      onChange(numValue);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-200">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          type="number"
          value={value ?? 0}
          onChange={handleChange}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          className={`w-full px-3 py-2 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition ${error
              ? "bg-red-950/20 border-red-500 focus:ring-red-500"
              : "bg-gray-900 border-gray-800 focus:ring-emerald-500"
            }`}
        />
        {suffix && (
          <span className="absolute right-3 top-2 text-sm text-gray-400">
            {suffix}
          </span>
        )}
      </div>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}
