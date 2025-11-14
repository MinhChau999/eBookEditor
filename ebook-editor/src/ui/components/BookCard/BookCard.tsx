import React from 'react';

export interface BookCardProps {
  title: string;
  cover?: string;
  description?: string;
  meta?: string;
  badge?: string;
  icon?: string;
  href?: string;
  onClick?: () => void;
  variant?: 'book' | 'template' | 'create';
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  disabled?: boolean;
  target?: '_blank' | '_self' | '_parent' | '_top';
}

export const BookCard: React.FC<BookCardProps> = ({
  title,
  cover,
  description,
  meta,
  badge,
  icon,
  href,
  onClick,
  variant = 'book',
  className = '',
  style,
  children,
  disabled = false,
  target = '_self'
}) => {
  const isCreateVariant = variant === 'create';
  const isTemplateVariant = variant === 'template';
  const hasImage = cover && !isCreateVariant;
  const hasDescription = description && (isTemplateVariant || isCreateVariant);

  const cardClasses = [
    'content-card',
    isCreateVariant && 'content-card-create',
    disabled && 'content-card-disabled',
    className
  ].filter(Boolean).join(' ');

  const mediaClasses = [
    'content-media',
    hasImage && 'content-media-book',
    isCreateVariant && 'content-media-create'
  ].filter(Boolean).join(' ');

  const infoClasses = [
    'content-info',
    isCreateVariant && 'content-info-create'
  ].filter(Boolean).join(' ');

  const CardContent = (
    <div className={cardClasses} style={style} onClick={disabled ? undefined : onClick}>
      {/* Media Section */}
      <div className={mediaClasses}>
        {hasImage ? (
          <>
            <img
              src={cover}
              alt={`${title} cover`}
              className="book-cover-image"
              loading="lazy"
            />
            {badge && (
              <span className="template-badge">{badge}</span>
            )}
          </>
        ) : icon ? (
          <i className={`${icon} content-media-icon`}></i>
        ) : isCreateVariant ? (
          <i className="fas fa-plus content-media-icon"></i>
        ) : null}
      </div>

      {/* Info Section */}
      <div className={infoClasses}>
        <h3 className="content-title" title={title}>
          {title}
        </h3>

        {hasDescription && (
          <p className="content-description" title={description}>
            {description}
          </p>
        )}

        {meta && !hasDescription && (
          <p className="content-meta">{meta}</p>
        )}

        {children}
      </div>
    </div>
  );

  // If href is provided, render as a link, otherwise as a div
  if (href && !disabled) {
    return (
      <a
        href={href}
        className="book-card-link"
        target={target}
        rel={target === '_blank' ? 'noopener noreferrer' : undefined}
      >
        {CardContent}
      </a>
    );
  }

  return CardContent;
};

// Create Book Card component for convenience
export interface CreateBookCardProps {
  title?: string;
  description?: string;
  icon?: string;
  href?: string;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
}

export const CreateBookCard: React.FC<CreateBookCardProps> = ({
  title = 'Create New Book',
  description,
  icon = 'fas fa-plus',
  href,
  onClick,
  className = '',
  style,
  disabled = false
}) => {
  return (
    <BookCard
      title={title}
      description={description}
      icon={icon}
      href={href}
      onClick={onClick}
      variant="create"
      className={className}
      style={style}
      disabled={disabled}
    />
  );
};

// Template Book Card component for convenience
export interface TemplateBookCardProps {
  title: string;
  cover: string;
  description: string;
  badge?: string;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
}

export const TemplateBookCard: React.FC<TemplateBookCardProps> = ({
  title,
  cover,
  description,
  badge,
  onClick,
  className = '',
  style,
  disabled = false
}) => {
  return (
    <BookCard
      title={title}
      cover={cover}
      description={description}
      badge={badge}
      onClick={onClick}
      variant="template"
      className={className}
      style={style}
      disabled={disabled}
    />
  );
};

// Book Item component for convenience
export interface BookItemProps {
  title: string;
  cover: string;
  meta?: string;
  href?: string;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  target?: '_blank' | '_self' | '_parent' | '_top';
}

export const BookItem: React.FC<BookItemProps> = ({
  title,
  cover,
  meta,
  href,
  onClick,
  className = '',
  style,
  disabled = false,
  target = '_self'
}) => {
  return (
    <BookCard
      title={title}
      cover={cover}
      meta={meta}
      href={href}
      onClick={onClick}
      variant="book"
      className={className}
      style={style}
      disabled={disabled}
      target={target}
    />
  );
};