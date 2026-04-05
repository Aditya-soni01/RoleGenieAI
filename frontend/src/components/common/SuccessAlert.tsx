import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface SuccessAlertProps {
  message?: string;
  className?: string;
}

const SuccessAlert: React.FC<SuccessAlertProps> = ({ message = 'Success!', className = '' }) => (
  <div className={`flex items-center gap-3 rounded-lg border border-green-700 bg-green-900/30 px-4 py-3 text-sm text-green-300 ${className}`}>
    <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
    <span>{message}</span>
  </div>
);

export default SuccessAlert;
