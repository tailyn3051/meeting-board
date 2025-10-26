import React from 'react';

interface CardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, children, className = '' }) => {
  return (
    <div className={`bg-white dark:bg-slate-700/50 p-4 rounded-lg shadow-md border border-amber-100 dark:border-slate-600 print:break-inside-avoid ${className}`}>
      <h3 className="text-sm font-medium text-gray-500 dark:text-slate-400">{title}</h3>
      {children}
    </div>
  );
};

export default Card;
