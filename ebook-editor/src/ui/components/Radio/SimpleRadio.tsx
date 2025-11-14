import React, { useId } from 'react';

export interface SimpleRadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SimpleRadioProps {
  name?: string;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  label?: string;
  helperText?: string;
  options: SimpleRadioOption[];
  onChange?: (value: string) => void;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
}

export const SimpleRadio: React.FC<SimpleRadioProps> = ({
  name,
  value,
  defaultValue,
  disabled = false,
  required = false,
  error = false,
  label,
  helperText,
  options,
  onChange,
  className = '',
  style,
  id
}) => {
  const generatedId = useId();
  const radioName = name || `radio-${generatedId}`;
  const radioId = id || `radio-group-${generatedId}`;

  const selectedValue = value || defaultValue || '';

  const handleChange = (optionValue: string) => {
    if (onChange && !disabled) {
      onChange(optionValue);
    }
  };

  return (
    <div className="eb-field-wrapper-full-width" style={style}>
      {label && (
        <label
          htmlFor={radioId}
          className={`eb-label ${required ? 'eb-label-required' : ''} ${error ? 'eb-label-error' : ''}`}
        >
          {label}
        </label>
      )}

      <div className={`eb-field eb-field-radio-group ${error ? 'eb-field-error' : ''} ${disabled ? 'eb-field-disabled' : ''} ${className}`}>
        <div className="eb-radio-items">
          {options.map((option, index) => (
            <div
              key={option.value}
              className={`eb-radio-item ${option.disabled ? 'eb-radio-item-disabled' : ''}`}
            >
              <input
                type="radio"
                name={radioName}
                id={`${radioId}-${index}`}
                value={option.value}
                checked={selectedValue === option.value}
                disabled={disabled || option.disabled}
                onChange={() => handleChange(option.value)}
              />
              <label
                htmlFor={`${radioId}-${index}`}
                className="eb-radio-item-label"
              >
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {helperText && (
        <p className={`eb-field-helper ${error ? 'eb-field-helper-error' : ''}`}>
          {helperText}
        </p>
      )}
    </div>
  );
};