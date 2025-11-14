import React, { useId } from 'react';

export interface SimpleInputProps {
  type?: 'text' | 'email' | 'password' | 'search' | 'number' | 'url';
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  label?: string;
  helperText?: string;
  iconLeft?: string;
  iconRight?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onKeyUp?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  name?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  step?: string;
  min?: string | number;
  max?: string | number;
  readOnly?: boolean;
}

export const SimpleInput: React.FC<SimpleInputProps> = ({
  type = 'text',
  placeholder,
  value,
  defaultValue,
  disabled = false,
  required = false,
  error = false,
  label,
  helperText,
  iconLeft,
  iconRight,
  onChange,
  onFocus,
  onBlur,
  onKeyDown,
  onKeyUp,
  className = '',
  style,
  id,
  name,
  autoComplete,
  autoFocus = false,
  maxLength,
  minLength,
  pattern,
  step,
  min,
  max,
  readOnly = false
}) => {
  const generatedId = useId();
  const inputId = id || `input-${generatedId}`;

  const fieldClasses = [
    'eb-field',
    'eb-field-full-width',
    error && 'eb-field-error',
    disabled && 'eb-field-disabled',
    className
  ].filter(Boolean).join(' ');

  const inputProps = {
    type,
    placeholder,
    value,
    defaultValue,
    disabled,
    required,
    id: inputId,
    name,
    autoComplete,
    autoFocus,
    maxLength,
    minLength,
    pattern,
    step,
    min,
    max,
    readOnly,
    onChange: disabled || readOnly ? undefined : onChange,
    onFocus: disabled || readOnly ? undefined : onFocus,
    onBlur: disabled || readOnly ? undefined : onBlur,
    onKeyDown: disabled || readOnly ? undefined : onKeyDown,
    onKeyUp: disabled || readOnly ? undefined : onKeyUp,
    style: {
      paddingRight: iconRight ? '30px' : undefined,
      paddingLeft: iconLeft ? '30px' : undefined
    }
  };

  return (
    <div className="eb-field-wrapper-full-width" style={style}>
      {label && (
        <label
          htmlFor={inputId}
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
          <input
            {...inputProps}
            className={`eb-input eb-focus-glow ${error ? 'eb-error-shake' : ''}`}
          />
        </div>

        {iconRight && (
          <span className="eb-field-icon eb-field-icon-right">
            <i className={iconRight}></i>
          </span>
        )}
      </div>

      {helperText && (
        <p className={`eb-field-helper ${error ? 'eb-field-helper-error' : ''}`}>
          {helperText}
        </p>
      )}
    </div>
  );
};