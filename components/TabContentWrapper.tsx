import React from 'react';

interface TabContentWrapperProps {
  title: string;
  children: React.ReactNode;
  isFirstPrintSection?: boolean;
}

const TabContentWrapper: React.FC<TabContentWrapperProps> = ({ title, children, isFirstPrintSection = false }) => {
  return (
    <div className={`mb-10 last:mb-0 ${isFirstPrintSection ? '' : 'print:break-before-page'}`}>
      <h2 className="text-2xl font-bold text-amber-800 dark:text-amber-400 mb-4 pb-2 border-b border-amber-200 dark:border-slate-700">{title}</h2>
      {children}
    </div>
  );
};

export default TabContentWrapper;
