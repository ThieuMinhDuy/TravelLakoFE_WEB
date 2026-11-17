import React from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';
import './css/Spinner.css';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  color?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  className,
}) => {
  const sizeClass = `ui-spinner--${size}`;

  return (
    <Loader2
      className={cn('ui-spinner', sizeClass, className)}
    />
  );
};
