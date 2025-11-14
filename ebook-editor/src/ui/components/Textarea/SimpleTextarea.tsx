import React, { useId } from 'react';

export interface SimpleTextareaProps {
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  label?: string;
  helperText?: string;
  rows?: number;
  minLength?: number;
  maxLength?: number;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onKeyUp?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  name?: string;
  autoFocus?: boolean;
  readOnly?: boolean;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

export const SimpleTextarea: React.FC<SimpleTextareaProps> = ({
  value,
  defaultValue,
  placeholder,
  disabled = false,
  required = false,
  error = false,
  label,
  helperText,
  rows = 4,
  minLength,
  maxLength,
  onChange,
  onFocus,
  onBlur,
  onKeyDown,
  onKeyUp,
  className = '',
  style,
  id,
  name,
  autoFocus = false,
  readOnly = false,
  resize = 'vertical'
}) => {
  const generatedId = useId();
  const textareaId = id || `textarea-${generatedId}`;

  const fieldClasses = [
    'eb-field',
    'eb-field-textarea',
    'eb-field-full-width',
    error && 'eb-field-error',
    disabled && 'eb-field-disabled',
    className
  ].filter(Boolean).join(' ');

  const textareaProps = {
    value,
    defaultValue,
    placeholder,
    disabled,
    required,
    id: textareaId,
    name,
    autoFocus,
    rows,
    minLength,
    maxLength,
    readOnly,
    onChange: disabled || readOnly ? undefined : onChange,
    onFocus: disabled || readOnly ? undefined : onFocus,
    onBlur: disabled || readOnly ? undefined : onBlur,
    onKeyDown: disabled || readOnly ? undefined : onKeyDown,
    onKeyUp: disabled || readOnly ? undefined : onKeyUp,
    style: {
      resize: resize
    }
  };

  return (
    <div className="eb-field-wrapper-full-width" style={style}>
      {label && (
        <label
          htmlFor={textareaId}
          className={`eb-label ${required ? 'eb-label-required' : ''} ${error ? 'eb-label-error' : ''}`}
        >
          {label}
        </label>
      )}

      <div className={fieldClasses}>
        <textarea {...textareaProps} />
      </div>

      {helperText && (
        <p className={`eb-field-helper ${error ? 'eb-field-helper-error' : ''}`}>
          {helperText}
        </p>
      )}
    </div>
  );
};