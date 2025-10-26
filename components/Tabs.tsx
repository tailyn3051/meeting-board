import React from 'react';

interface TabsProps {
  tabs: string[];
  activeTab: string;
  onTabClick: (tab: string) => void;
}

const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabClick }) => {
  return (
    <nav className="flex border-b border-amber-200 dark:border-slate-700 mb-6 space-x-4 md:space-x-8 no-print">
      {tabs.map(tab => (
        <button
          key={tab}
          onClick={() => onTabClick(tab)}
          className={`py-3 px-1 md:px-4 text-gray-600 dark:text-slate-400 hover:text-amber-700 dark:hover:text-amber-400 focus:outline-none transition-colors duration-200 ${
            activeTab === tab ? 'border-b-2 border-amber-700 dark:border-amber-500 text-amber-700 dark:text-amber-500 font-semibold' : ''
          }`}
        >
          {tab}
        </button>
      ))}
    </nav>
  );
};

export default Tabs;
