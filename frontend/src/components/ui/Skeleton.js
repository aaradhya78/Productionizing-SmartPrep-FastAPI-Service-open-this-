import React from 'react';
import './ui.css';

export const Skeleton = ({ className = '', width, height, borderRadius, style, ...props }) => {
  const customStyle = {
    width: width !== undefined ? width : undefined,
    height: height !== undefined ? height : undefined,
    borderRadius: borderRadius !== undefined ? borderRadius : undefined,
    ...style
  };

  return (
    <div
      className={`ui-skeleton ${className}`}
      style={customStyle}
      {...props}
    />
  );
};

export const SkeletonText = ({ lines = 3, className = '', ...props }) => {
  return (
    <div className={`ui-skeleton-text-container ${className}`} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height="14px"
          width={i === lines - 1 && lines > 1 ? '60%' : '100%'}
          style={{ marginBottom: i === lines - 1 ? 0 : '8px' }}
        />
      ))}
    </div>
  );
};

export const SkeletonCard = ({ className = '', ...props }) => {
  return (
    <div className={`ui-skeleton-card ${className}`} {...props}>
      <Skeleton height="24px" width="40%" style={{ marginBottom: '16px' }} />
      <SkeletonText lines={3} />
    </div>
  );
};
