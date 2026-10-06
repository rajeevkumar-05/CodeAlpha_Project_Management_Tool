import React from 'react';

const StatusBadge = ({ status }) => {
  const normalized = (status || 'Todo').toLowerCase().replace(/\s+/g, '-');

  const icons = {
    'todo': '⭕',
    'in-progress': '⚡',
    'done': '✅'
  };

  return (
    <span className={`status-badge ${normalized}`}>
      <span>{icons[normalized] || '•'}</span>
      <span>{status || 'Todo'}</span>
    </span>
  );
};

export default StatusBadge;
