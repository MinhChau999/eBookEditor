import React, { useId } from 'react';

export interface SimpleSwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  label?: string;
  helperText?: string;
  size?: 'small' | 'medium' | 'large';
  onChange?: (checked: boolean) => void;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  name?: string;
  autoFocus?: boolean;
}

export const SimpleSwitch: React.FC<SimpleSwitchProps> = ({
  checked,
  defaultChecked = false,
  disabled = false,
  required = false,
  error = false,
  label,
  helperText,
  size = 'medium',
  onChange,
  className = '',
  style,
  id,
  name,
  autoFocus = false
}) => {
  const generatedId = useId();
  const switchId = id || `switch-${generatedId}`;
  const [internalChecked, setInternalChecked] = React.useState(defaultChecked);

  const isChecked = checked !== undefined ? checked : internalChecked;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newChecked = e.target.checked;
    if (checked === undefined) {
      setInternalChecked(newChecked);
    }
    if (onChange && !disabled) {
      onChange(newChecked);
    }
  };

  const switchClasses = [
    'eb-switch',
    `eb-switch-${size}`,
    isChecked && 'eb-switch-checked',
    disabled && 'eb-switch-disabled',
    error && 'eb-switch-error'
  ].filter(Boolean).join(' ');

  return (
    <div className={`eb-field-wrapper-full-width ${error ? 'eb-field-error' : ''} ${disabled ? 'eb-field-disabled' : ''} ${className}`} style={style}>
      <label htmlFor={switchId} className="eb-switch-label">
        <input
          type="checkbox"
          id={switchId}
          name={name}
          checked={isChecked}
          disabled={disabled}
          required={required}
          autoFocus={autoFocus}
          onChange={handleChange}
          style={{ display: 'none' }}
        />
        <span className={switchClasses}>
          <span className="eb-switch-slider"></span>
        </span>
        {label && (
          <span className={`eb-switch-text ${required ? 'eb-switch-text-required' : ''}`}>
            {label}
          </span>
        )}
      </label>

      {helperText && (
        <p className={`eb-field-helper ${error ? 'eb-field-helper-error' : ''}`}>
          {helperText}
        </p>
      )}
    </div>
  );
};