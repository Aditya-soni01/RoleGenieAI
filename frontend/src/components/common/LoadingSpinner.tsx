import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message }) => (
  <div className="flex flex-col items-center justify-center p-8 gap-3">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-600 border-t-primary-500" />
    {message && <p className="text-sm text-slate-400">{message}</p>}
  </div>
);

export default LoadingSpinner;
