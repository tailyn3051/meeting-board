import React, { useState } from 'react';
import { SpecDetails } from '../types.ts';
import EditableField from './EditableField.tsx';

interface SpecsTabProps {
  specs: SpecDetails[];
  onSpecChange: (specId: string, itemKey: string, value: string) => void;
  onAddSpec: () => void;
  onDeleteSpec: (specId: string) => void;
  onAddSpecItem: (specId: string) => void;
  onDeleteSpecItem: (specId: string, itemKey: string) => void;
  onSpecItemKeyChange: (specId: string, oldKey: string, newKey: string) => void;
  onReorderSpecs: (specs: SpecDetails[]) => void;
}

const SpecsTab: React.FC<SpecsTabProps> = ({ specs, onSpecChange, onAddSpec, onDeleteSpec, onAddSpecItem, onDeleteSpecItem, onSpecItemKeyChange, onReorderSpecs }) => {
  const [draggedSpecId, setDraggedSpecId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    setDraggedSpecId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.style.opacity = '0.5';
    e.currentTarget.classList.add('shadow-2xl', 'border-amber-400', 'dark:border-amber-500');
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
    e.preventDefault();
    if (!draggedSpecId || draggedSpecId === targetId) return;

    const draggedIndex = specs.findIndex(s => s.id === draggedSpecId);
    const targetIndex = specs.findIndex(s => s.id === targetId);
    
    const newSpecs = [...specs];
    const [draggedItem] = newSpecs.splice(draggedIndex, 1);
    newSpecs.splice(targetIndex, 0, draggedItem);
    
    onReorderSpecs(newSpecs);
    setDraggedSpecId(null);
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.opacity = '1';
    e.currentTarget.classList.remove('shadow-2xl', 'border-amber-400', 'dark:border-amber-500');
    setDraggedSpecId(null);
  };

  return (
    <section className="space-y-6">
      <p className="text-base text-gray-700 dark:text-slate-300">
        此處詳列了本次試產的關鍵技術規格與製程參數。這些是確保品質與一致性的重要依據。
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {specs.map((spec) => (
          <div 
            key={spec.id} 
            draggable
            onDragStart={(e) => handleDragStart(e, spec.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, spec.id)}
            onDragEnd={handleDragEnd}
            className="group/card relative bg-white dark:bg-slate-800/50 p-6 rounded-lg shadow-md border border-amber-100 dark:border-slate-700 flex flex-col print:break-inside-avoid cursor-move transition-all duration-200"
          >
            <button
              onClick={() => onDeleteSpec(spec.id)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold opacity-0 group-hover/card:opacity-100 transition-opacity z-10 no-print"
              title="Delete Spec"
            >
              &times;
            </button>
            <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-400 mb-3">
              <EditableField
                  as="span"
                  initialValue={spec.title}
                  onSave={(newValue) => onSpecChange(spec.id, 'title', newValue)}
                  className="w-full"
              />
            </h3>
            <div className="flex-grow">
              <ul className="list-disc list-outside ml-5 space-y-2 text-gray-800 dark:text-slate-300">
                {Object.entries(spec.items).map(([key, value]) => (
                  <li key={key} className="group/item flex items-center">
                    <EditableField
                      as="span"
                      initialValue={key}
                      onSave={(newKey) => onSpecItemKeyChange(spec.id, key, newKey)}
                      className="font-medium mr-1"
                    />:
                    <EditableField
                      as="span"
                      initialValue={value}
                      onSave={(newValue) => onSpecChange(spec.id, key, newValue)}
                      className="flex-grow ml-2"
                    />
                     <button
                        onClick={() => onDeleteSpecItem(spec.id, key)}
                        className="ml-2 text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity text-lg no-print"
                        title="Delete parameter"
                      >
                        &times;
                      </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-4 no-print">
               <button
                  onClick={() => onAddSpecItem(spec.id)}
                  className="text-sm font-medium p-1 rounded-md cursor-pointer transition-colors duration-200 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-500/10"
                >
                  + Add Parameter
                </button>
            </div>
          </div>
        ))}
      </div>
       <div className="text-center mt-8 no-print">
        <button
            onClick={onAddSpec}
            className="font-medium p-3 rounded-lg shadow-sm cursor-pointer transition-all duration-200 ease-in-out bg-green-200 text-green-900 dark:bg-green-500/20 dark:text-green-300 dark:hover:bg-green-500/30 hover:transform hover:-translate-y-0.5 hover:shadow-lg"
          >
            Add New Spec +
          </button>
      </div>
    </section>
  );
};

export default SpecsTab;
