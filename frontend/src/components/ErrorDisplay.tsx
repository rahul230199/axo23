import React from 'react';

interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, onRetry }) => {
  return (
    <div style={{
      textAlign: 'center',
      padding: '60px',
      background: 'white',
      borderRadius: '20px',
      border: '1px solid #fee2e2',
    }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
      <h3 style={{ color: '#dc2626', marginBottom: '8px' }}>Error Loading Data</h3>
      <p style={{ color: '#6b7280', marginBottom: '20px' }}>{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            padding: '10px 20px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorDisplay;
