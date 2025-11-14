import React, { useId } from 'react';

export interface SimpleColorPickerProps {
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  label?: string;
  helperText?: string;
  showHex?: boolean;
  presetColors?: string[];
  onChange?: (color: string) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  name?: string;
  autoFocus?: boolean;
}

export const SimpleColorPicker: React.FC<SimpleColorPickerProps> = ({
  value,
  defaultValue = '#000000',
  disabled = false,
  required = false,
  error = false,
  label,
  helperText,
  showHex = true,
  presetColors = [
    '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
    '#ffff00', '#ff00ff', '#00ffff', '#ff8800', '#8800ff'
  ],
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
  const colorId = id || `color-${generatedId}`;
  const [internalValue, setInternalValue] = React.useState(defaultValue);

  const currentValue = value !== undefined ? value : internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    if (value === undefined) {
      setInternalValue(newColor);
    }
    if (onChange && !disabled) {
      onChange(newColor);
    }
  };

  const handlePresetClick = (color: string) => {
    if (value === undefined) {
      setInternalValue(color);
    }
    if (onChange && !disabled) {
      onChange(color);
    }
  };

  const fieldClasses = [
    'eb-field',
    'eb-field-color-picker',
    'eb-field-full-width',
    error && 'eb-field-error',
    disabled && 'eb-field-disabled',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="eb-field-wrapper-full-width" style={style}>
      {label && (
        <label
          htmlFor={colorId}
          className={`eb-label ${required ? 'eb-label-required' : ''} ${error ? 'eb-label-error' : ''}`}
        >
          {label}
        </label>
      )}

      <div className={fieldClasses}>
        <div className="eb-color-picker-wrapper">
          <input
            type="color"
            id={colorId}
            name={name}
            value={currentValue}
            disabled={disabled}
            required={required}
            autoFocus={autoFocus}
            onChange={handleChange}
            onFocus={disabled ? undefined : onFocus}
            onBlur={disabled ? undefined : onBlur}
          />
          {showHex && (
            <input
              type="text"
              value={currentValue}
              disabled={disabled}
              onChange={handleChange}
              className="eb-color-picker-hex"
              placeholder="#000000"
            />
          )}
        </div>
      </div>

      {presetColors.length > 0 && (
        <div className="eb-color-picker-presets">
          {presetColors.map((color, index) => (
            <button
              key={index}
              type="button"
              className={`eb-color-preset ${currentValue === color ? 'eb-color-preset-active' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => handlePresetClick(color)}
              disabled={disabled}
              title={color}
            />
          ))}
        </div>
      )}

      {helperText && (
        <p className={`eb-field-helper ${error ? 'eb-field-helper-error' : ''}`}>
          {helperText}
        </p>
      )}
    </div>
  );
};