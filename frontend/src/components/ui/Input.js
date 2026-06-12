import React from 'react';
import './ui.css';

export const Input = ({
  label,
  id,
  error,
  helpText,
  className = '',
  ...props
}) => {
  return (
    <div className={`ui-input-wrapper ${className}`}>
      {label && <label htmlFor={id} className="ui-label">{label}</label>}
      <input
        id={id}
        className={`ui-input ${error ? 'error' : ''}`}
        {...props}
      />
      {error && <span className="ui-input-help error">{error}</span>}
      {helpText && !error && <span className="ui-input-help">{helpText}</span>}
    </div>
  );
};
