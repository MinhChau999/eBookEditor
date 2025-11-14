import React, { useId } from 'react';

export interface SimpleRangeProps {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  label?: string;
  helperText?: string;
  showValue?: boolean;
  valuePrefix?: string;
  valueSuffix?: string;
  onChange?: (value: number) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  name?: string;
  autoFocus?: boolean;
}

export const SimpleRange: React.FC<SimpleRangeProps> = ({
  value,
  defaultValue = 0,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  required = false,
  error = false,
  label,
  helperText,
  showValue = true,
  valuePrefix = '',
  valueSuffix = '',
  onChange,
  onFocus,
  onBlur,
  className = '',
  style,
  id,
  name,
  autoFocus = false
}) => {
  const generatedId = useId();
  const rangeId = id || `range-${generatedId}`;
  const [internalValue, setInternalValue] = React.useState(defaultValue);

  const currentValue = value !== undefined ? value : internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    if (value === undefined) {
      setInternalValue(newValue);
    }
    if (onChange && !disabled) {
      onChange(newValue);
    }
  };

  const fieldClasses = [
    'eb-field',
    'eb-field-range',
    'eb-field-full-width',
    error && 'eb-field-error',
    disabled && 'eb-field-disabled',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="eb-field-wrapper-full-width" style={style}>
      {label && (
        <div className="eb-range-header">
          <label
            htmlFor={rangeId}
            className={`eb-label ${required ? 'eb-label-required' : ''} ${error ? 'eb-label-error' : ''}`}
          >
            {label}
          </label>
          {showValue && (
            <span className={`eb-range-value ${error ? 'eb-range-value-error' : ''}`}>
              {valuePrefix}{currentValue}{valueSuffix}
            </span>
          )}
        </div>
      )}

      <div className={fieldClasses}>
        <input
          type="range"
          id={rangeId}
          name={name}
          min={min}
          max={max}
          step={step}
          value={currentValue}
          disabled={disabled}
          required={required}
          autoFocus={autoFocus}
          onChange={handleChange}
          onFocus={disabled ? undefined : onFocus}
          onBlur={disabled ? undefined : onBlur}
          className={`eb-range ${error ? 'eb-range-error' : ''} eb-focus-glow`}
        />
      </div>

      {helperText && (
        <p className={`eb-field-helper ${error ? 'eb-field-helper-error' : ''}`}>
          {helperText}
        </p>
      )}
    </div>
  );
};