import React from 'react';
import './AnalyticsCard.css';

const AnalyticsCard = ({ title, value, subtitle, icon: Icon, colorClass }) => {
  return (
    <div className={`analytics-card ${colorClass}`}>
      <div className="card-header">
        <h3 className="card-title">{title}</h3>
        {Icon && <div className="card-icon"><Icon size={24} /></div>}
      </div>
      <div className="card-body">
        <div className="card-value">{value}</div>
        {subtitle && <div className="card-subtitle">{subtitle}</div>}
      </div>
    </div>
  );
};

export default AnalyticsCard;
