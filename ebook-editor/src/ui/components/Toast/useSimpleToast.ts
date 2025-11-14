import React, { useState, useCallback, useRef } from 'react';
import { type ToastMessage } from './SimpleToast';

let toastCounter = 0;

const DEFAULT_CONFIG = {
  closable: true,
  showProgress: true,
  pauseOnHover: true,
} as const;

const DURATION_CONFIG = {
  success: 5000,
  error: 8000,
  warning: 6000,
  info: 4000,
} as const;

const TITLES = {
  success: 'Success',
  error: 'Error',
  warning: 'Warning',
  info: 'Info',
} as const;

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const toastTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const clearToastTimer = useCallback((id: string) => {
    const timer = toastTimers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      toastTimers.current.delete(id);
    }
  }, []);

  const setToastTimer = useCallback((id: string, duration?: number) => {
    if (!duration) return;

    clearToastTimer(id);

    const timer = setTimeout(() => {
      removeToast(id);
    }, duration);

    toastTimers.current.set(id, timer);
  }, [clearToastTimer]);

  const removeToast = useCallback((id: string) => {
    clearToastTimer(id);
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, [clearToastTimer]);

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${++toastCounter}`;
    const duration = toast.duration ?? DURATION_CONFIG[toast.type];

    const newToast: ToastMessage = {
      ...DEFAULT_CONFIG,
      ...toast,
      id,
      duration,
    };

    setToasts(prev => [...prev, newToast]);

    if (duration && duration > 0) {
      setToastTimer(id, duration);
    }

    return id;
  }, [setToastTimer]);

  const showToast = useCallback((
    type: ToastMessage['type'],
    message: string,
    options: Partial<Omit<ToastMessage, 'id' | 'type' | 'message'>> = {}
  ) => {
    return addToast({
      type,
      message,
      title: TITLES[type],
      ...options
    });
  }, [addToast]);

  const showSuccess = useCallback((message: string, options = {}) => {
    return showToast('success', message, options);
  }, [showToast]);

  const showError = useCallback((message: string, options = {}) => {
    return showToast('error', message, options);
  }, [showToast]);

  const showWarning = useCallback((message: string, options = {}) => {
    return showToast('warning', message, options);
  }, [showToast]);

  const showInfo = useCallback((message: string, options = {}) => {
    return showToast('info', message, options);
  }, [showToast]);

  const clearAll = useCallback(() => {
    toastTimers.current.forEach(timer => clearTimeout(timer));
    toastTimers.current.clear();
    setToasts([]);
  }, []);

  React.useEffect(() => {
    return () => {
      toastTimers.current.forEach(timer => clearTimeout(timer));
      toastTimers.current.clear();
    };
  }, []);

  return {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    clearAll,
    setToastTimer,
    clearToastTimer,
  };
};