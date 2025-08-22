import React from 'react';

function ProgressBar({ completed, total, showPercentage = true, size = 'medium' }) {
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
  
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'h-2 text-xs';
      case 'large':
        return 'h-4 text-sm';
      default:
        return 'h-3 text-sm';
    }
  };

  const getColorClass = () => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    if (percentage >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="progress-container">
      <div className="progress-bar-wrapper">
        <div 
          className={`progress-bar ${getColorClass()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showPercentage && (
        <div className="progress-text">
          {completed}/{total} ({percentage}%)
        </div>
      )}
    </div>
  );
}

export default ProgressBar;
