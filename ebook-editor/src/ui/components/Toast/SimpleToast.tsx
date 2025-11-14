import React, { useEffect, useRef, useCallback, memo } from 'react';
import { createPortal } from 'react-dom';

export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

export interface ToastProps {
  id: string;
  type?: ToastType;
  title?: string;
  message: string;
  duration?: number;
  closable?: boolean;
  showProgress?: boolean;
  pauseOnHover?: boolean;
  onClose?: (id: string) => void;
  position?: ToastPosition;
  className?: string;
  style?: React.CSSProperties;
}

export interface ToastContainerProps {
  position?: ToastPosition;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

// Toast Icons - memoized for performance
const ToastIcons = {
  success: 'fas fa-check-circle',
  error: 'fas fa-exclamation-circle',
  warning: 'fas fa-exclamation-triangle',
  info: 'fas fa-info-circle'
};

// Toast Component - memoized to prevent unnecessary re-renders
const ToastComponent = memo<ToastProps>(({
  id,
  type = 'info',
  title,
  message,
  duration = 5000,
  closable = true,
  showProgress = true,
  pauseOnHover = true,
  onClose,
  position = 'top-right',
  className = '',
  style
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [isPaused, setIsPaused] = React.useState(false);
  const [progress, setProgress] = React.useState(100);

  // Refs for timer management
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const progressRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const pauseTimeRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  // Memoize handlers to prevent recreating functions on every render
  const handleClose = useCallback(() => {
    setIsVisible(false);
    // Remove from DOM after animation completes
    setTimeout(() => {
      onClose?.(id);
    }, 300);
  }, [onClose, id]);

  const handleMouseEnter = useCallback(() => {
    if (!pauseOnHover || !timerRef.current) return;

    setIsPaused(true);
    pauseTimeRef.current = Date.now() - startTimeRef.current;

    if (progressRef.current) {
      clearInterval(progressRef.current);
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, [pauseOnHover]);

  const handleMouseLeave = useCallback(() => {
    if (!pauseOnHover || !isPaused) return;

    setIsPaused(false);
    const remainingTime = Math.max(100, duration - pauseTimeRef.current);

    timerRef.current = setTimeout(() => {
      handleClose();
    }, remainingTime);

    if (showProgress && remainingTime > 100) {
      const interval = 100;
      const step = (interval / remainingTime) * 100;

      progressRef.current = setInterval(() => {
        setProgress(prev => Math.max(0, prev - step));
      }, interval);
    }
  }, [pauseOnHover, isPaused, duration, showProgress, handleClose]);

  // Setup timer only once when component mounts
  useEffect(() => {
    // Trigger entrance animation in the next tick
    const animationTimer = setTimeout(() => {
      setIsVisible(true);
    }, 0);

    startTimeRef.current = Date.now();

    if (duration > 0) {
      timerRef.current = setTimeout(() => {
        handleClose();
      }, duration);

      if (showProgress) {
        const interval = 100;
        const step = (interval / duration) * 100;

        progressRef.current = setInterval(() => {
          setProgress(prev => Math.max(0, prev - step));
        }, interval);
      }
    }

    return () => {
      clearTimeout(animationTimer);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [duration, showProgress, handleClose]);

  // Memoize position classes
  const positionClass = React.useMemo(() => {
    const map = {
      'top-right': 'eb-toast-animation-right',
      'top-left': 'eb-toast-animation-left',
      'bottom-right': 'eb-toast-animation-bottom',
      'bottom-left': 'eb-toast-animation-left'
    };
    return map[position];
  }, [position]);

  // Memoize CSS classes
  const toastClasses = React.useMemo(() => [
    'eb-toast',
    `eb-toast-${type}`,
    isVisible && 'eb-toast-show',
    !isVisible && 'eb-toast-hide',
    isPaused && 'eb-toast-paused',
    positionClass,
    className
  ].filter(Boolean).join(' '), [type, isVisible, isPaused, positionClass, className]);

  return (
    <div
      className={toastClasses}
      style={style}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="alert"
      aria-live="polite"
    >
      {/* Icon */}
      <div className="eb-toast-icon">
        <i className={ToastIcons[type]} />
      </div>

      {/* Content */}
      <div className="eb-toast-content">
        {title && <div className="eb-toast-title">{title}</div>}
        <div className="eb-toast-message">{message}</div>
      </div>

      {/* Close Button */}
      {closable && (
        <button
          type="button"
          className="eb-toast-close"
          onClick={handleClose}
          aria-label="Close notification"
        >
          <i className="fas fa-times" />
        </button>
      )}

      {/* Progress Bar */}
      {showProgress && duration > 0 && (
        <div
          className="eb-toast-progress"
          style={{
            width: `${progress}%`
          }}
        />
      )}
    </div>
  );
});

ToastComponent.displayName = 'ToastComponent';

// Toast Container - optimized with portal
export const ToastContainer: React.FC<ToastContainerProps> = ({
  position = 'top-right',
  className = '',
  style,
  children
}) => {
  const containerClasses = React.useMemo(() => [
    'eb-toast-container',
    `eb-toast-container-${position}`,
    className
  ].filter(Boolean).join(' '), [position, className]);

  return createPortal(
    <div className={containerClasses} style={style}>
      {children}
    </div>,
    document.body
  );
};

// Toast Manager - optimized with memo
export interface ToastMessage {
  id: string;
  type?: ToastType;
  title?: string;
  message: string;
  duration?: number;
  closable?: boolean;
  showProgress?: boolean;
  pauseOnHover?: boolean;
}

export interface ToastManagerProps {
  toasts: ToastMessage[];
  position?: ToastPosition;
  onRemove: (id: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const ToastManager = memo<ToastManagerProps>(({
  toasts,
  position = 'top-right',
  onRemove,
  className = '',
  style
}) => {
  if (toasts.length === 0) return null;

  return (
    <ToastContainer position={position} className={className} style={style}>
      {toasts.map((toast) => (
        <ToastComponent
          key={toast.id}
          {...toast}
          position={position}
          onClose={onRemove}
        />
      ))}
    </ToastContainer>
  );
});

ToastManager.displayName = 'ToastManager';

export default ToastComponent;