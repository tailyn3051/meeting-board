import React from 'react';
import EditableField from './EditableField.tsx';

interface HeaderProps {
    projectName: string;
    onProjectNameChange: (newValue: string) => void;
    onSaveAsPdf: () => void;
    appTitle: string;
    onAppTitleChange: (newValue: string) => void;
}

const Header: React.FC<HeaderProps> = ({ projectName, onProjectNameChange, onSaveAsPdf, appTitle, onAppTitleChange }) => {
    
    return (
        <header className="mb-6">
            <div className="flex justify-between items-start">
                <div>
                    <EditableField
                        as="h1"
                        initialValue={appTitle}
                        onSave={onAppTitleChange}
                        className="text-3xl md:text-4xl font-bold text-amber-900 dark:text-amber-400"
                        inputClassName="text-3xl md:text-4xl font-bold"
                    />
                    <div className="text-xl text-gray-700 dark:text-slate-300 mt-1 flex items-center">
                        <span className="whitespace-nowrap">專案：</span>
                        <EditableField 
                            as="span"
                            initialValue={projectName}
                            onSave={onProjectNameChange}
                            className="font-semibold ml-1"
                            inputClassName="text-xl"
                        />
                    </div>
                </div>
                <button
                    onClick={onSaveAsPdf}
                    className="no-print group ml-4 mt-1 p-2.5 rounded-xl border border-gray-300/80 dark:border-slate-600 bg-gray-200/60 dark:bg-slate-700 shadow-sm hover:bg-gray-200 dark:hover:bg-slate-600 active:shadow-inner transition-all duration-200"
                    title="Save as PDF"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 dark:text-slate-300 transition-colors group-hover:text-gray-800 dark:group-hover:text-slate-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                </button>
            </div>
        </header>
    );
};

export default Header;
