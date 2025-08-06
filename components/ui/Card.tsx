
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-base-200/60 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-base-300/50 ${className}`}>
      {children}
    </div>
  );
};