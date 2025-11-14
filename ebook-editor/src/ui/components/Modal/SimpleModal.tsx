import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export interface SimpleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  className?: string;
  overlayClassName?: string;
  contentClassName?: string;
  style?: React.CSSProperties;
  overlayStyle?: React.CSSProperties;
  contentStyle?: React.CSSProperties;
  preventBodyScroll?: boolean;
  centered?: boolean;
}

export const SimpleModal: React.FC<SimpleModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnBackdropClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  className = '',
  overlayClassName = '',
  contentClassName = '',
  style,
  overlayStyle,
  contentStyle,
  preventBodyScroll = true,
  centered = true
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Handle body scroll prevention
  useEffect(() => {
    if (isOpen && preventBodyScroll) {
      document.body.style.overflow = 'hidden';
      previousFocusRef.current = document.activeElement as HTMLElement;
    }

    return () => {
      if (preventBodyScroll) {
        document.body.style.overflow = '';
      }
    };
  }, [isOpen, preventBodyScroll]);

  // Handle focus restoration
  useEffect(() => {
    if (isOpen && modalRef.current) {
      // Focus first focusable element within modal
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      if (firstElement) {
        firstElement.focus();
      }
    }

    return () => {
      if (previousFocusRef.current && !isOpen) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, closeOnEscape, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnBackdropClick) {
      onClose();
    }
  };

  // Handle tab trapping
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'Tab' || !modalRef.current) return;

    const focusableElements = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  };

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'eb-modal-sm',
    md: 'eb-modal-md',
    lg: 'eb-modal-lg',
    xl: 'eb-modal-xl',
    full: 'eb-modal-full'
  };

  const modalContent = (
    <div
      className={`eb-modal-container ${overlayClassName}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        zIndex: 1000,
        alignItems: centered ? 'center' : 'flex-start',
        justifyContent: 'center',
        padding: centered ? '0' : '2rem 0',
        overflowY: 'auto',
        ...overlayStyle
      }}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
    >
      <div
        ref={modalRef}
        className={`eb-modal-dialog ${sizeClasses[size]} ${className}`}
        style={{
          margin: centered ? 'auto' : '0',
          borderRadius: '3px',
          fontFamily: 'var(--gjs-main-font)',
          position: 'relative',
          zIndex: 2,
          backgroundColor: 'var(--main-color, #444444)',
          color: 'var(--font-color, #dddddd)',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
          animation: 'eb-modal-slide-down 0.215s ease-out',
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          width: size === 'full' ? '100%' : '90%',
          maxWidth: size === 'full' ? '100%' : '850px',
          ...style
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {(title || showCloseButton) && (
          <div
            className="eb-modal-header"
            style={{
              padding: '0.9375rem',
              borderBottom: '1px solid var(--eb-border-color, #e5e7eb)',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            {title && (
              <h2
                id="modal-title"
                className="eb-modal-title"
                style={{
                  fontSize: '1rem',
                  fontWeight: '500',
                  margin: 0,
                  color: 'var(--font-color, #dddddd)'
                }}
              >
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                className="eb-modal-close"
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  width: '2rem',
                  height: '2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '0.25rem',
                  color: 'var(--font-color, #dddddd)',
                  transition: 'all 0.15s ease',
                  opacity: '0.7'
                }}
                aria-label="Close modal"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
        )}

        <div
          className={`eb-modal-content ${contentClassName}`}
          style={{
            padding: '0.9375rem',
            flex: 1,
            overflowY: 'auto',
            ...contentStyle
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );

  // Use portal to render modal at document.body level
  return createPortal(modalContent, document.body);
};

// Modal footer helper component
export interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const ModalFooter: React.FC<ModalFooterProps> = ({
  children,
  className = '',
  style
}) => (
  <div
    className={`eb-modal-footer ${className}`}
    style={{
      padding: '1rem 0.9375rem',
      borderTop: '1px solid var(--eb-border-color, #e5e7eb)',
      display: 'flex',
      gap: '0.5rem',
      justifyContent: 'flex-end',
      alignItems: 'center',
      ...style
    }}
  >
    {children}
  </div>
);

// Modal body helper component for better content organization
export interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const ModalBody: React.FC<ModalBodyProps> = ({
  children,
  className = '',
  style
}) => (
  <div
    className={`eb-modal-body ${className}`}
    style={{
      padding: '0.9375rem',
      ...style
    }}
  >
    {children}
  </div>
);