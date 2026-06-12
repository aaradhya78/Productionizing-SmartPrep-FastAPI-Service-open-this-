import React from 'react';
import './ui.css';

export const Button = ({
  children,
  variant = 'primary',
  className = '',
  icon: Icon,
  disabled,
  isLoading,
  ...props
}) => {
  const baseClass = 'ui-btn';
  const variantClass = `ui-btn-${variant}`;

  return (
    <button
      className={`${baseClass} ${variantClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="ui-btn-spinner" aria-hidden="true" />
      ) : Icon ? (
        <Icon size={16} />
      ) : null}
      {children}
    </button>
  );
};
