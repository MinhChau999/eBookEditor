import React, { useId } from 'react';

export interface SimpleSelectProps {
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  label?: string;
  helperText?: string;
  iconLeft?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLSelectElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLSelectElement>) => void;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  name?: string;
  autoFocus?: boolean;
  children: React.ReactNode;
}

export const SimpleSelect: React.FC<SimpleSelectProps> = ({
  value,
  defaultValue,
  disabled = false,
  required = false,
  error = false,
  label,
  helperText,
  iconLeft,
  onChange,
  onFocus,
  onBlur,
  className = '',
  style,
  id,
  name,
  autoFocus = false,
  children
}) => {
  const generatedId = useId();
  const selectId = id || `select-${generatedId}`;

  const fieldClasses = [
    'eb-field',
    'eb-field-select',
    'eb-field-full-width',
    error && 'eb-field-error',
    disabled && 'eb-field-disabled',
    className
  ].filter(Boolean).join(' ');

  const selectProps = {
    value,
    defaultValue,
    disabled,
    required,
    id: selectId,
    name,
    autoFocus,
    onChange: disabled ? undefined : onChange,
    onFocus: disabled ? undefined : onFocus,
    onBlur: disabled ? undefined : onBlur,
    style: {
      paddingLeft: iconLeft ? '30px' : undefined
    }
  };

  return (
    <div className="eb-field-wrapper-full-width" style={style}>
      {label && (
        <label
          htmlFor={selectId}
          className={`eb-label ${required ? 'eb-label-required' : ''} ${error ? 'eb-label-error' : ''}`}
        >
          {label}
        </label>
      )}

      <div className="eb-field-relative">
        {iconLeft && (
          <span className="eb-field-icon eb-field-icon-left">
            <i className={iconLeft}></i>
          </span>
        )}

        <div className={fieldClasses}>
          <select {...selectProps}>
            {children}
          </select>
          <div className="eb-select-arrow">
            <i className="fas fa-chevron-down"></i>
          </div>
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