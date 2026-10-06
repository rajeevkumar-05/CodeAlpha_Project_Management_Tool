import React from 'react';

const PriorityBadge = ({ priority }) => {
  const norm = (priority || 'Medium').toLowerCase();
  return (
    <span className={`priority-badge ${norm}`}>
      {priority || 'Medium'}
    </span>
  );
};

export default PriorityBadge;
