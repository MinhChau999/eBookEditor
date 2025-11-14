import React from 'react';

export interface SimpleButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  iconOnly?: boolean;
  children?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  title?: string;
}

export const SimpleButton: React.FC<SimpleButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  iconLeft,
  iconRight,
  iconOnly = false,
  children,
  onClick,
  type = 'button',
  className = '',
  title
}) => {
  const baseClasses = 'btn';
  const variantClasses = `btn-${variant}`;
  const sizeClasses = size !== 'medium' ? `btn-${size}` : '';
  const iconOnlyClasses = iconOnly ? 'btn-icon-only' : '';
  const loadingClasses = loading ? 'btn-loading' : '';
  const disabledClasses = disabled ? 'btn-disabled' : '';

  const classes = [
    baseClasses,
    variantClasses,
    sizeClasses,
    iconOnlyClasses,
    loadingClasses,
    disabledClasses,
    className
  ].filter(Boolean).join(' ');

  const buttonContent = (
    <>
      {loading && (
        <span className="btn-spinner">
          <i className="fas fa-spinner fa-spin"></i>
        </span>
      )}
      {!loading && iconLeft && (
        <i className={typeof iconLeft === 'string' ? iconLeft : ''}></i>
      )}
      {children && !iconOnly && (
        <span>{children}</span>
      )}
      {!loading && iconRight && (
        <i className={typeof iconRight === 'string' ? iconRight : ''}></i>
      )}
      {iconOnly && !loading && (
        <i className={typeof iconLeft === 'string' ? iconLeft :
                typeof iconRight === 'string' ? iconRight : ''}>
          {iconLeft || iconRight}
        </i>
      )}
    </>
  );

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={disabled || loading ? undefined : onClick}
      title={title}
    >
      {buttonContent}
    </button>
  );
};