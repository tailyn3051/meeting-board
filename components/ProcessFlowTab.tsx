import React, { useState, useMemo, useEffect } from 'react';
import { ProcessStep, SpecDetails } from '../types.ts';
import EditableField from './EditableField.tsx';
import Calendar from './Calendar.tsx';

interface ProcessFlowTabProps {
  steps: ProcessStep[];
  specs: SpecDetails[];
  projectId: string;
  title: string;
  onTitleChange: (newTitle: string) => void;
  onStepChange: (stepId: string, key: 'name' | 'details' | 'startDate' | 'endDate', value: string) => void;
  onBulkStepDateChange: (stepIds: string[], key: 'startDate' | 'endDate', value: string) => void;
  onAddStep: () => void;
  onDeleteStep: (stepId: string) => void;
  onToggleStep: (stepId: string) => void;
  onReorderSteps: (steps: ProcessStep[]) => void;
  onLinkStepToSpec: (stepId: string, specId: string | null) => void;
}

const ProcessFlowTab: React.FC<ProcessFlowTabProps> = ({ steps, specs, projectId, title, onTitleChange, onStepChange, onBulkStepDateChange, onAddStep, onDeleteStep, onToggleStep, onReorderSteps, onLinkStepToSpec }) => {
  const [selectedStepIds, setSelectedStepIds] = useState<string[]>(() => {
    const firstActive = steps.find(s => s.isActive);
    return firstActive ? [firstActive.id] : [];
  });
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [editingDateField, setEditingDateField] = useState<'startDate' | 'endDate'>('startDate');
  const [isLinkingSpec, setIsLinkingSpec] = useState(false);

  useEffect(() => {
    // Filter out any selected IDs that are no longer active
    const currentlyActiveSelection = selectedStepIds.filter(id => 
        steps.find(step => step.id === id)?.isActive
    );

    if (currentlyActiveSelection.length !== selectedStepIds.length) {
        setSelectedStepIds(currentlyActiveSelection);
    }
  }, [steps, selectedStepIds]);


  useEffect(() => {
    setEditingDateField('startDate');
    setIsLinkingSpec(false);
  }, [selectedStepIds.join(',')]); // Depend on the selection identity

  const activeSteps = useMemo(() => steps.filter(s => s.isActive), [steps]);
  const inactiveSteps = useMemo(() => steps.filter(s => !s.isActive), [steps]);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    setDraggedItemId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.style.opacity = '0.5';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); 
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
    e.preventDefault();
    if (!draggedItemId || draggedItemId === targetId) return;

    const reorderedActiveSteps = [...activeSteps];
    const draggedIndex = reorderedActiveSteps.findIndex(s => s.id === draggedItemId);
    const targetIndex = reorderedActiveSteps.findIndex(s => s.id === targetId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;
    
    const [draggedItem] = reorderedActiveSteps.splice(draggedIndex, 1);
    reorderedActiveSteps.splice(targetIndex, 0, draggedItem);
    
    onReorderSteps([...reorderedActiveSteps, ...inactiveSteps]);
    setDraggedItemId(null);
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.opacity = '1';
    setDraggedItemId(null);
  };
  
  const handleStepSelect = (stepId: string, isMultiSelect: boolean) => {
    if (isMultiSelect) {
        setSelectedStepIds(prev => 
            prev.includes(stepId) 
                ? prev.filter(id => id !== stepId)
                : [...prev, stepId]
        );
    } else {
        setSelectedStepIds([stepId]);
    }
  };

  const selectedStep = useMemo(() => {
    if (selectedStepIds.length === 1) {
        return steps.find(s => s.id === selectedStepIds[0]);
    }
    return null;
  }, [selectedStepIds, steps]);

  const relatedSpec = useMemo(() => {
    if (!selectedStep || !selectedStep.relatedSpecId) return null;
    return specs.find(spec => spec.id === selectedStep.relatedSpecId);
  }, [selectedStep, specs]);
  
  const handleDateSelect = (date: Date) => {
    if (selectedStepIds.length > 0 && editingDateField) {
        if (editingDateField === 'startDate') {
            date.setHours(9, 0, 0, 0);
        } else {
            date.setHours(17, 0, 0, 0);
        }
        
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        
        const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}`;

        onBulkStepDateChange(selectedStepIds, editingDateField, formattedDate);
    }
  };
  
  const selectedDateForCalendar = useMemo(() => {
    if (selectedStepIds.length !== 1) return null; // Only show for single selection
    const step = steps.find(s => s.id === selectedStepIds[0]);
    if (!step) return null;

    const dateString = editingDateField === 'startDate' ? step.startDate : step.endDate;
    if (dateString) {
        try {
            return new Date(dateString);
        } catch {
            return null;
        }
    }
    return null;
  }, [selectedStepIds, steps, editingDateField]);
  
  const getCommonDateValue = (field: 'startDate' | 'endDate'): string => {
      if (selectedStepIds.length === 0) return '';
      const firstStep = steps.find(s => s.id === selectedStepIds[0]);
      if (!firstStep) return '';
      const firstDate = firstStep[field];
      const allSame = selectedStepIds.every(id => {
          const step = steps.find(s => s.id === id);
          return step && step[field] === firstDate;
      });
      return allSame ? firstDate : '';
  };


  const ActiveStepNode = ({ step, index, totalActiveSteps }: { step: ProcessStep, index: number, totalActiveSteps: number }) => {
    const isSelected = selectedStepIds.includes(step.id);
    const isFirst = index === 0;
    const isLast = index === totalActiveSteps - 1;

    let bgColor = 'bg-teal-500 hover:bg-teal-600'; // Middle
    if (isFirst) bgColor = 'bg-sky-500 hover:bg-sky-600';   // Start
    if (isLast) bgColor = 'bg-emerald-500 hover:bg-emerald-600'; // Finish

    let clipPathStyle = {};
    if (totalActiveSteps > 1) {
        if (isFirst) {
            clipPathStyle = { clipPath: 'polygon(0% 0%, calc(100% - 1.25rem) 0%, 100% 50%, calc(100% - 1.25rem) 100%, 0% 100%)' };
        } else if (isLast) {
            clipPathStyle = { clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 1.25rem 50%)' };
        } else {
            clipPathStyle = { clipPath: 'polygon(0% 0%, calc(100% - 1.25rem) 0%, 100% 50%, calc(100% - 1.25rem) 100%, 0% 100%, 1.25rem 50%)' };
        }
    }

    return (
      <div
        draggable
        onDragStart={(e) => handleDragStart(e, step.id)}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, step.id)}
        onDragEnd={handleDragEnd}
        onClick={(e) => handleStepSelect(step.id, e.ctrlKey || e.metaKey)}
        className={`group/step relative flex items-center justify-start h-12 text-white font-semibold transition-all duration-200 cursor-move ${bgColor}`}
        style={{ 
            ...clipPathStyle,
            filter: isSelected ? 'drop-shadow(0 0 8px #f59e0b)' : 'none',
            paddingLeft: isFirst || totalActiveSteps === 1 ? '1rem' : '2.25rem',
            paddingRight: isLast || totalActiveSteps === 1 ? '1rem' : '2.25rem',
        }}
      >
        <div className="relative z-10 flex items-center gap-2">
            <button
                onClick={(e) => { e.stopPropagation(); onToggleStep(step.id); }}
                className="h-6 w-6 flex-shrink-0 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 transition-colors no-print"
                title="Mark as Skipped"
            >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                 </svg>
            </button>
            <EditableField
                as="span"
                initialValue={step.name}
                onSave={(v) => onStepChange(step.id, 'name', v)}
                className="text-center whitespace-nowrap"
                inputClassName="text-black dark:text-white font-semibold text-sm"
            />
        </div>

        <button
            onClick={(e) => { e.stopPropagation(); onDeleteStep(step.id); }}
            className="absolute top-[-8px] right-[8px] bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs opacity-0 group-hover/step:opacity-100 hover:bg-red-600 transition-all z-20 no-print"
            title="Delete Step"
        >
          &times;
        </button>
      </div>
    );
  };


  const SkippedStepNode = ({ step }: { step: ProcessStep }) => (
    <button
      onClick={() => onToggleStep(step.id)}
      className="flex items-center justify-center gap-2 h-12 w-40 rounded-md border-2 border-dashed border-gray-300 dark:border-slate-600 text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 hover:border-gray-400 dark:hover:border-slate-500 transition-colors no-print"
      title="Re-activate Step"
    >
      <div className="h-5 w-5 flex-shrink-0 flex items-center justify-center rounded-full bg-gray-300 dark:bg-slate-600 text-gray-600 dark:text-slate-300 text-sm font-bold">+</div>
      <span className="truncate">{step.name}</span>
    </button>
  );

  return (
    <section className="space-y-6">
      <p className="text-base text-gray-700 dark:text-slate-300">
        This is the complete manufacturing and quality control flow for {projectId}. Drag steps to reorder, click the status icon to activate/deactivate, double-click names to edit, or click a step to view details. Use <strong>Ctrl/Cmd + Click</strong> to select multiple steps.
      </p>
      <div className="bg-white dark:bg-slate-800/50 p-4 md:p-6 rounded-lg shadow-md border border-amber-100 dark:border-slate-700 print:break-inside-avoid">
        <EditableField 
            as="h2"
            initialValue={title}
            onSave={onTitleChange}
            className="text-xl font-semibold mb-12 text-amber-900 dark:text-amber-400 text-center"
            inputClassName="text-xl font-semibold text-center"
        />
        <div className="flex flex-wrap items-center justify-center gap-2 py-4 print:block">
          {activeSteps.map((step, index) => (
            <ActiveStepNode 
                key={step.id} 
                step={step} 
                index={index} 
                totalActiveSteps={activeSteps.length} 
            />
          ))}
           <button
            onClick={onAddStep}
            className="ml-2 h-12 w-40 flex items-center justify-center rounded-md border-2 border-dashed border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 font-semibold cursor-pointer transition-all duration-200 ease-in-out hover:bg-green-100 dark:hover:bg-green-500/20 hover:border-green-500 dark:hover:border-green-500 no-print"
          >
            Add Step +
          </button>
        </div>

        {inactiveSteps.length > 0 && (
          <div className="mt-16 pt-8 border-t border-dashed border-amber-300 dark:border-slate-700 no-print">
            <h3 className="text-lg font-semibold text-gray-600 dark:text-slate-400 mb-6 text-center">Skipped Steps</h3>
            <div className="flex flex-wrap items-center justify-center gap-8">
              {inactiveSteps.map(step => <SkippedStepNode key={step.id} step={step} />)}
            </div>
          </div>
        )}
        
        <div className="mt-12 mb-6 border-t border-amber-200 dark:border-slate-700 pt-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    { selectedStepIds.length > 1 && (
                        <div className="mb-6 p-3 text-center bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg text-amber-900 dark:text-amber-300 font-semibold">
                            {selectedStepIds.length} steps selected. You can now bulk edit their dates below.
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-400 mb-2">步驟詳情 (Details):</h3>
                            <div className="mt-2 p-1 bg-amber-50 dark:bg-slate-700 rounded-lg min-h-[120px] text-gray-800 dark:text-slate-300 border border-amber-200 dark:border-slate-600 transition-all duration-300">
                                {selectedStep ? (
                                <EditableField
                                        as="div"
                                        initialValue={selectedStep.details}
                                        onSave={(newValue) => onStepChange(selectedStep.id, 'details', newValue)}
                                        className="p-3 w-full h-full"
                                        inputClassName="p-3"
                                    />
                                ) : (
                                    <div className="p-3 text-gray-500 dark:text-slate-500 flex items-center justify-center h-full no-print">
                                        {selectedStepIds.length > 1 
                                            ? "Details for single steps shown here." 
                                            : "Select an active step above to view or edit its details."}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-400 mb-2">相關規格 (Related Specs):</h3>
                            { isLinkingSpec && selectedStep ? (
                                <div className="bg-white dark:bg-slate-600 p-4 rounded-lg shadow-inner border border-blue-400 h-full mt-2 no-print">
                                    <select
                                        value={selectedStep.relatedSpecId || ''}
                                        onChange={(e) => {
                                            onLinkStepToSpec(selectedStep.id, e.target.value || null);
                                            setIsLinkingSpec(false);
                                        }}
                                        onBlur={() => setIsLinkingSpec(false)}
                                        autoFocus
                                        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-600"
                                    >
                                        <option value="" className="text-gray-500">-- No Related Spec --</option>
                                        {specs.map(spec => (
                                            <option key={spec.id} value={spec.id} className="text-black bg-white dark:text-white dark:bg-slate-600">{spec.title}</option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <div 
                                    onDoubleClick={() => { if (selectedStep) setIsLinkingSpec(true); }}
                                    title={selectedStep ? "Double-click to change related spec" : ""}
                                    className={`h-full mt-2 ${selectedStep ? 'cursor-pointer' : ''} print:cursor-default`}
                                >
                                    {relatedSpec ? (
                                        <div className="bg-white dark:bg-slate-700/50 p-4 rounded-lg shadow-inner border border-amber-200 dark:border-slate-700 h-full">
                                            <h4 className="text-md font-semibold text-amber-800 dark:text-amber-400 mb-2">{relatedSpec.title}</h4>
                                            <ul className="list-disc list-outside ml-5 space-y-1 text-sm text-gray-700 dark:text-slate-300">
                                                {Object.entries(relatedSpec.items).map(([key, value]) => (
                                                    <li key={key}>
                                                        <span className="font-medium">{key}:</span> {String(value)}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center bg-gray-50 dark:bg-slate-700/50 rounded-lg h-full min-h-[150px] border border-dashed border-gray-300 dark:border-slate-600/50">
                                            <p className="text-gray-500 dark:text-slate-500 text-center p-4">
                                                {selectedStepIds.length > 1 ? "Specs for single steps shown here." : selectedStep ? "No related specs for this step." : "Select a step to see specs."}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {selectedStepIds.length > 0 && (
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 border-t border-amber-200 dark:border-slate-700 pt-6 no-print">
                            <div 
                                onClick={() => setEditingDateField('startDate')}
                                className={`rounded-lg cursor-pointer p-1 transition-all ${editingDateField === 'startDate' ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}
                            >
                                <h4 className="text-sm font-semibold text-gray-600 dark:text-slate-400 mb-1">Start Date/Time</h4>
                                <EditableField 
                                    type="datetime-local"
                                    initialValue={getCommonDateValue('startDate')}
                                    onSave={(v) => onBulkStepDateChange(selectedStepIds, 'startDate', v)}
                                    className="p-2 border dark:border-slate-600 rounded-md w-full"
                                    inputClassName="p-2"
                                />
                            </div>
                            <div 
                                onClick={() => setEditingDateField('endDate')}
                                className={`rounded-lg cursor-pointer p-1 transition-all ${editingDateField === 'endDate' ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}
                            >
                                <h4 className="text-sm font-semibold text-gray-600 dark:text-slate-400 mb-1">End Date/Time</h4>
                                <EditableField 
                                    type="datetime-local"
                                    initialValue={getCommonDateValue('endDate')}
                                    onSave={(v) => onBulkStepDateChange(selectedStepIds, 'endDate', v)}
                                    className="p-2 border dark:border-slate-600 rounded-md w-full"
                                    inputClassName="p-2"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-1 no-print">
                    <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-400 mb-2">專案日曆 (Project Calendar):</h3>
                    <div className="bg-white dark:bg-slate-700/50 p-4 rounded-lg shadow-inner border border-amber-200 dark:border-slate-700 mt-2">
                        <Calendar 
                            events={steps} 
                            onDateClick={handleDateSelect} 
                            selectedDate={selectedDateForCalendar}
                        />
                    </div>
                </div>
            </div>
        </div>

      </div>
    </section>
  );
};

export default ProcessFlowTab;
