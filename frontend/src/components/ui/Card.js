import React from 'react';
import './ui.css';

export const Card = ({ children, className = '', hoverable = false, ...props }) => {
  return (
    <div className={`ui-card ${hoverable ? 'hoverable' : ''} ${className}`} {...props}>
      {children}
    </div>
  );
};
