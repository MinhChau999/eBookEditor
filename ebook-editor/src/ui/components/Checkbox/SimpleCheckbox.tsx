import React, { useId } from 'react';

export interface SimpleCheckboxProps {
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  label?: string;
  helperText?: string;
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  name?: string;
  autoFocus?: boolean;
}

export const SimpleCheckbox: React.FC<SimpleCheckboxProps> = ({
  checked,
  defaultChecked = false,
  disabled = false,
  required = false,
  error = false,
  label,
  helperText,
  indeterminate = false,
  onChange,
  className = '',
  style,
  id,
  name,
  autoFocus = false
}) => {
  const generatedId = useId();
  const checkboxId = id || `checkbox-${generatedId}`;
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

  const checkboxRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <div className={`eb-field-wrapper-full-width ${error ? 'eb-field-error' : ''} ${disabled ? 'eb-field-disabled' : ''} ${className}`} style={style}>
        <label
          htmlFor={checkboxId}
          className={`eb-checkbox-label ${disabled ? 'eb-checkbox-label-disabled' : ''}`}
        >
          <input
            ref={checkboxRef}
            type="checkbox"
            id={checkboxId}
            name={name}
            checked={isChecked}
            disabled={disabled}
            required={required}
            autoFocus={autoFocus}
            onChange={handleChange}
            style={{ display: 'none' }}
          />
          <span className={`eb-checkbox-icon ${isChecked ? 'eb-checkbox-icon-checked' : ''} ${indeterminate ? 'eb-checkbox-icon-indeterminate' : ''}`}></span>
          {label && (
            <span className={`eb-checkbox-text ${required ? 'eb-checkbox-text-required' : ''}`}>
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