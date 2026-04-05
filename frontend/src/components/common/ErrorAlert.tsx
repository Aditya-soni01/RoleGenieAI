import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorAlertProps {
  message?: string;
  className?: string;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ message = 'An error occurred.', className = '' }) => (
  <div className={`flex items-center gap-3 rounded-lg border border-red-700 bg-red-900/30 px-4 py-3 text-sm text-red-300 ${className}`}>
    <AlertCircle className="h-4 w-4 flex-shrink-0" />
    <span>{message}</span>
  </div>
);

export default ErrorAlert;
