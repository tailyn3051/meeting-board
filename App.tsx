import React, { useState, useMemo, useEffect } from 'react';
import Header from './components/Header.tsx';
import Tabs from './components/Tabs.tsx';
import OverviewTab from './components/OverviewTab.tsx';
import SpecsTab from './components/SpecsTab.tsx';
import ProcessFlowTab from './components/ProcessFlowTab.tsx';
import ScheduleTab from './components/ScheduleTab.tsx';
import AttendeesTab from './components/AttendeesTab.tsx';
import { ProjectDetails, SpecDetails, ProcessStep, GanttTask, ScheduleTask } from './types.ts';
import TabContentWrapper from './components/TabContentWrapper.tsx';

const LOCAL_STORAGE_KEY = 'npi-meeting-board-state';

// Initial Data derived from the Whiteboard Image
const initialProjectDetails: ProjectDetails = {
  id: 'Enter Project ID',
  quantity: 0,
  pcbSize: '0 x 0 x 0 mm',
  targetShipDate: '',
};

const initialSpecs: SpecDetails[] = [
  {
    id: 'spec-smt',
    title: 'SMT Spec',
    items: {
      'Total units': 'Enter details here',
      'Top side': 'Enter details here',
      'Bottom side': 'Enter details here',
    },
  },
  {
    id: 'spec-dip-manual',
    title: 'DIP Spec (manual)',
    items: {
      'Relay pin': 'Enter details here',
      '手焊零件': 'New Value',
      '插件': 'New Value',
    },
  },
  {
    id: 'spec-test',
    title: 'Test Spec',
    items: {
      'Test time': 'Enter details here',
    },
  },
  {
    id: 'spec-pcb',
    title: 'PCB Spec',
    items: {
      'Layer Count': 'Enter value',
      'Material': 'e.g., FR-4',
      'Thickness': 'e.g., 1.6mm',
      'Surface Finish': 'e.g., ENIG',
    },
  },
  {
    id: 'spec-firmware',
    title: 'Firmware Spec',
    items: {
      'Version': 'Enter version number',
      'Flashing Method': 'e.g., JTAG, SWD',
    },
  },
  {
    id: 'spec-mechanical',
    title: 'Mechanical Spec',
    items: {
      'Enclosure Dimensions': 'L x W x H mm',
      'Material': 'e.g., ABS, Aluminum',
      'Finish': 'e.g., Matte, Anodized',
    },
  },
  {
    id: 'spec-packaging',
    title: 'Packaging Spec',
    items: {
      'Box Type': 'e.g., Corrugated',
      'Labeling Standard': 'Enter details',
      'Units per Box': 'Enter number',
    },
  },
  {
    id: 'spec-quality',
    title: 'Quality & Inspection Spec',
    items: {
      'AQL Level': 'e.g., 0.65',
      'Cosmetic Standard': 'Reference document',
    },
  },
  {
    id: 'spec-tooling',
    title: 'Tooling & Fixture Spec',
    items: {
      'Test Fixture ID': 'Enter ID',
      'Assembly Jig': 'Enter details',
      'Stencil Thickness': 'e.g., 0.12mm',
    },
  },
  {
    id: 'spec-regulatory',
    title: 'Regulatory Compliance',
    items: {
      'RoHS': 'Compliant / Non-compliant',
      'FCC / CE': 'Required / Not Required',
    },
  },
  {
    id: 'spec-assembly',
    title: 'Assembly Spec',
    items: {
      'torque': 'New Value',
      'Assembly Jig': 'New Value',
    },
  },
  {
    id: 'spec-dip-general',
    title: 'DIP Spec',
    items: {
      'Total units': 'New Value',
      'Top side': 'New Value',
      'Bottom side': 'New Value',
    },
  },
  {
    id: 'spec-aoi-inspection',
    title: 'AOI Inspection Spec',
    items: {
      'Inspection Coverage': 'SMT components',
    },
  },
  {
    id: 'spec-aoi-photo',
    title: 'AOI Photo Spec',
    items: {
      'Resolution': 'e.g., 10 megapixels',
      'Lighting': 'e.g., Coaxial, Side',
      'File Format': 'e.g., JPEG, PNG',
    },
  },
  {
    id: 'spec-wash',
    title: 'Wash Spec',
    items: {
      'Cycle': 'New Value',
      'Temperature': 'New Value',
      'Time': 'New Value',
    },
  },
];


const initialProcessSteps: ProcessStep[] = [
  { id: 'step-1', name: '建BOM', details: 'Bill of Materials creation and finalization.', type: 'process', isActive: true, startDate: '', endDate: '', relatedSpecId: null },
  { id: 'step-2', name: '料到', details: 'Receiving and incoming inspection of all components.', type: 'process', isActive: true, startDate: '', endDate: '', relatedSpecId: null },
  { id: 'step-3', name: 'PCB到', details: 'Receiving and incoming inspection of bare PCBs.', type: 'process', isActive: true, startDate: '', endDate: '', relatedSpecId: 'spec-pcb' },
  { id: 'step-4', name: 'SMT', details: 'Surface Mount Technology assembly process.', type: 'process', isActive: true, startDate: '', endDate: '', relatedSpecId: 'spec-smt' },
  { id: 'step-6', name: 'PF', details: 'Press-fit component assembly.', type: 'process', isActive: true, startDate: '', endDate: '', relatedSpecId: 'spec-dip-general' },
  { id: 'step-7', name: '手焊', details: 'Manual soldering of specific components.', type: 'process', isActive: true, startDate: '', endDate: '', relatedSpecId: 'spec-dip-manual' },
  { id: 'step-9', name: '插件', details: 'manually Insertion', type: 'process', isActive:true, startDate: '', endDate: '', relatedSpecId: 'spec-dip-manual' },
  { id: 'step-8', name: '水洗', details: 'Washing, Cleaning PCBA to remove flux and contaminants.', type: 'process', isActive: true, startDate: '', endDate: '', relatedSpecId: 'spec-wash' },
  { id: 'step-5', name: 'SMT 目檢', details: 'Visual inspection of SMT components and solder joints.', type: 'qc', isActive: true, startDate: '', endDate: '', relatedSpecId: 'spec-aoi-inspection' },
  { id: 'step-10', name: 'FPT', details: 'Fly Probe testing.', type: 'test', isActive: true, startDate: '', endDate: '', relatedSpecId: 'spec-test' },
  { id: 'step-11', name: 'QC', details: 'Final quality control checks.', type: 'qc', isActive: true, startDate: '', endDate: '', relatedSpecId: 'spec-quality' },
  { id: 'step-12', name: 'AOI 拍照', details: 'Automated Optical Inspection and photography for documentation.', type: 'qc', isActive: true, startDate: '', endDate: '', relatedSpecId: 'spec-aoi-photo' },
  { id: 'step-13', name: 'Pack', details: 'Prepare and package the final product for shipment.', type: 'pack', isActive: true, startDate: '', endDate: '', relatedSpecId: 'spec-packaging' },
  { id: 'step-14', name: '出貨 (Shipping)', details: 'Final product shipment.', type: 'pack', isActive: true, startDate: '', endDate: '', relatedSpecId: null },
  { id: 'step-aoi-inspect', name: 'AOI Inspection', details: 'Automated Optical Inspection of SMT assembly.', type: 'qc', isActive: true, startDate: '', endDate: '', relatedSpecId: 'spec-aoi-inspection' },
  { id: 'step-15', name: 'DIP', details: 'Through-hole component insertion.', type: 'process', isActive: true, startDate: '', endDate: '', relatedSpecId: 'spec-dip-manual' },
  { id: 'step-16', name: 'Function Test', details: 'Comprehensive functional testing.', type: 'test', isActive: true, startDate: '', endDate: '', relatedSpecId: 'spec-test' },
];

const initialAttendees: string[] = [];
const initialAppTitle = '試產會議';
const initialProcessFlowTitle = 'Manufacturing Process Flow';
const initialMeetingDate = new Date().toISOString().split('T')[0];


const loadState = () => {
    try {
        const serializedState = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (serializedState === null) {
            return undefined;
        }
        return JSON.parse(serializedState);
    } catch (err) {
        console.error("Could not load state", err);
        return undefined;
    }
};

const saveState = (state: any) => {
    try {
        const serializedState = JSON.stringify(state);
        localStorage.setItem(LOCAL_STORAGE_KEY, serializedState);
    } catch (err) {
        console.error("Could not save state", err);
    }
};


const App: React.FC = () => {
  const savedState = loadState();

  const [appTitle, setAppTitle] = useState(savedState?.appTitle || initialAppTitle);
  const [activeTab, setActiveTab] = useState('總覽與時程 (Overview & Schedule)');
  
  const [projectDetails, setProjectDetails] = useState<ProjectDetails>(savedState?.projectDetails || initialProjectDetails);
  const [specs, setSpecs] = useState<SpecDetails[]>(savedState?.specs || initialSpecs);
  const [processSteps, setProcessSteps] = useState<ProcessStep[]>(savedState?.processSteps || initialProcessSteps);
  const [processFlowTitle, setProcessFlowTitle] = useState(savedState?.processFlowTitle || initialProcessFlowTitle);
  const [attendees, setAttendees] = useState<string[]>(savedState?.attendees || initialAttendees);
  const [meetingDate, setMeetingDate] = useState(savedState?.meetingDate || initialMeetingDate);

  useEffect(() => {
    const stateToSave = {
      appTitle,
      projectDetails,
      specs,
      processSteps,
      processFlowTitle,
      attendees,
      meetingDate,
    };
    saveState(stateToSave);
  }, [appTitle, projectDetails, specs, processSteps, processFlowTitle, attendees, meetingDate]);

  
  const TABS = ['總覽與時程 (Overview & Schedule)', '規格與流程 (Specs & Process Flow)', '與會人員 (Attendees)'];

  const handleAppTitleChange = (newTitle: string) => {
    setAppTitle(newTitle);
  };

  const handleProjectNameChange = (newName: string) => {
    setProjectDetails(prev => ({ ...prev, id: newName }));
  };

  const handleDetailChange = (key: keyof ProjectDetails, value: string) => {
    setProjectDetails(prev => ({ ...prev, [key]: key === 'quantity' ? Number(value) || 0 : value }));
  };
  
  const handleSpecChange = (specId: string, itemKey: string, value: string) => {
    setSpecs(prev => prev.map(spec => {
      if (spec.id === specId) {
        if (itemKey === 'title') {
          return { ...spec, title: String(value) };
        }
        return {
          ...spec,
          items: { ...spec.items, [itemKey]: value }
        };
      }
      return spec;
    }));
  };

  const handleSpecItemKeyChange = (specId: string, oldKey: string, newKey: string) => {
    if (!newKey || oldKey === newKey) return; // Prevent empty or unchanged keys
    setSpecs(prev => prev.map(spec => {
      if (spec.id === specId) {
        const newItems: Record<string, string | number> = {};
        for (const [key, value] of Object.entries(spec.items)) {
          if (key === oldKey) {
            newItems[newKey] = value as string | number;
          } else {
            newItems[key] = value as string | number;
          }
        }
        return { ...spec, items: newItems };
      }
      return spec;
    }));
  };

  const handleAddSpec = () => {
    const newSpec: SpecDetails = {
      id: crypto.randomUUID(),
      title: 'New Spec',
      items: {}
    };
    setSpecs(prev => [...prev, newSpec]);
  };

  const handleAddSpecItem = (specId: string) => {
    setSpecs(prev => prev.map(spec => {
      if (spec.id === specId) {
        let i = 1;
        let newKey = `Parameter ${i}`;
        while (Object.prototype.hasOwnProperty.call(spec.items, newKey)) {
          i++;
          newKey = `Parameter ${i}`;
        }
        const newItems = { ...spec.items, [newKey]: 'New Value' };
        return { ...spec, items: newItems };
      }
      return spec;
    }));
  };

  const handleDeleteSpecItem = (specId: string, itemKey: string) => {
    setSpecs(prev => prev.map(spec => {
      if (spec.id === specId) {
        const newItems = { ...spec.items };
        delete newItems[itemKey];
        return { ...spec, items: newItems };
      }
      return spec;
    }));
  };
  
  const handleDeleteSpec = (specId: string) => {
    setProcessSteps(prev => prev.map(step => 
      step.relatedSpecId === specId ? { ...step, relatedSpecId: null } : step
    ));
    setSpecs(prev => prev.filter(spec => spec.id !== specId));
  };

  const handleReorderSpecs = (newSpecs: SpecDetails[]) => {
    setSpecs(newSpecs);
  };

  const handleStepChange = (stepId: string, key: 'name' | 'details' | 'startDate' | 'endDate', value: string) => {
    setProcessSteps(prev =>
      prev.map(step => (step.id === stepId ? { ...step, [key]: value } : step))
    );
  };

  const handleBulkStepDateChange = (stepIds: string[], key: 'startDate' | 'endDate', value: string) => {
    setProcessSteps(prev => 
      prev.map(step => 
        stepIds.includes(step.id) ? { ...step, [key]: value } : step
      )
    );
  };
  
  const handleLinkStepToSpec = (stepId: string, specId: string | null) => {
    setProcessSteps(prev => prev.map(step => step.id === stepId ? { ...step, relatedSpecId: specId } : step));
  };

  const handleAddStep = () => {
    const newStep: ProcessStep = {
      id: crypto.randomUUID(),
      name: 'New Step',
      details: 'Click to edit details for the new step.',
      type: 'process',
      isActive: true,
      startDate: '',
      endDate: ''
    };
    setProcessSteps(prev => [...prev, newStep]);
  };

  const handleDeleteStep = (stepId: string) => {
    setProcessSteps(prev => prev.filter(step => step.id !== stepId));
  };

  const handleToggleStep = (stepId: string) => {
    setProcessSteps(prev =>
      prev.map(step =>
        step.id === stepId ? { ...step, isActive: !step.isActive } : step
      )
    );
  };
  
  const handleReorderSteps = (newSteps: ProcessStep[]) => {
    setProcessSteps(newSteps);
  };

  const handleProcessFlowTitleChange = (newTitle: string) => {
    setProcessFlowTitle(newTitle);
  };
  
  const handleAttendeesChange = (value: string) => {
    setAttendees(value.split('\n').filter(name => name.trim() !== ''));
  };
  
  const handleMeetingDateChange = (newDate: string) => {
    setMeetingDate(newDate);
  };

  const scheduleTasks = useMemo((): ScheduleTask[] => {
    const dayFormatter = new Intl.DateTimeFormat('zh-TW-u-ca-chinese', { weekday: 'short' });
    const getDay = (dateStr: string) => {
        try {
            const date = new Date(dateStr + 'T00:00:00'); // Ensure parsing as local time
            if (isNaN(date.getTime())) return '-';
            return dayFormatter.format(date).replace('週', '');
        } catch { return '-'; }
    };
    
    const derivedTasks: ScheduleTask[] = processSteps
      .filter(step => step.isActive && step.startDate)
      .flatMap(step => {
        const tasksForStep: ScheduleTask[] = [];
        try {
            const start = new Date(step.startDate);
            start.setHours(0, 0, 0, 0);
            let end = step.endDate ? new Date(step.endDate) : new Date(start);
            end.setHours(0, 0, 0, 0);

            if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return [];
            
            const firstDayNotes = () => {
                let note = step.details;
                if (step.relatedSpecId) {
                    const spec = specs.find(s => s.id === step.relatedSpecId);
                    if (spec && Object.keys(spec.items).length > 0) {
                        const specDetails = Object.entries(spec.items)
                            .map(([key, value]) => `${key}: ${String(value)}`)
                            .join('; ');
                        note += ` | Related Spec: ${spec.title} | ${specDetails}`;
                    }
                }
                return note;
            };

            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                tasksForStep.push({
                    date: d.toISOString().split('T')[0],
                    day: getDay(d.toISOString().split('T')[0]),
                    task: step.name,
                    notes: d.getTime() === start.getTime() ? firstDayNotes() : `(續)`,
                    ganttGroup: step.type,
                });
            }
        } catch { return []; }
        return tasksForStep;
      });

    const allTasks = [...derivedTasks];
    if (projectDetails.targetShipDate) {
        allTasks.push({
            date: projectDetails.targetShipDate,
            day: getDay(projectDetails.targetShipDate),
            task: '目標出貨 (Target Ship Date)',
            notes: `Final shipment for ${projectDetails.quantity} pcs.`,
            highlight: 'text-red-700 font-bold',
            ganttGroup: 'Shipment',
        });
    }
    return allTasks.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [processSteps, specs, projectDetails.targetShipDate, projectDetails.quantity]);

  const ganttTasks = useMemo((): GanttTask[] => {
    return processSteps
      .filter(step => step.isActive && step.startDate && step.endDate)
      .map(step => {
        const start = new Date(step.startDate);
        const end = new Date(step.endDate);
        return {
          name: step.name,
          start: start,
          end: end.getHours() === 0 && end.getMinutes() === 0 ? new Date(end.getTime() + 24 * 60 * 60 * 1000 - 1) : end
        };
      })
      .sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [processSteps]);

  const handleSaveAsPdf = () => {
    window.print();
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 sm:p-6 md:p-8 border border-amber-200 dark:border-slate-700 print-container">
        <Header 
          projectName={projectDetails.id} 
          onProjectNameChange={handleProjectNameChange} 
          onSaveAsPdf={handleSaveAsPdf}
          appTitle={appTitle}
          onAppTitleChange={handleAppTitleChange}
        />
        <Tabs tabs={TABS} activeTab={activeTab} onTabClick={setActiveTab} />
        <main>
          <div className={activeTab === '總覽與時程 (Overview & Schedule)' ? '' : 'hidden print-show'}>
             <TabContentWrapper title="總覽 (Overview)" isFirstPrintSection={true}>
                <OverviewTab details={projectDetails} tasks={ganttTasks} onDetailChange={handleDetailChange} />
            </TabContentWrapper>
            <TabContentWrapper title="時程與任務 (Schedule)">
                <ScheduleTab tasks={scheduleTasks} onTaskChange={() => {}} />
            </TabContentWrapper>
          </div>

          <div className={activeTab === '規格與流程 (Specs & Process Flow)' ? '' : 'hidden print-show'}>
            <TabContentWrapper title="流程 (Process Flow)">
               <ProcessFlowTab 
                  steps={processSteps} 
                  specs={specs}
                  projectId={projectDetails.id}
                  title={processFlowTitle}
                  onTitleChange={handleProcessFlowTitleChange}
                  onStepChange={handleStepChange}
                  onBulkStepDateChange={handleBulkStepDateChange}
                  onAddStep={handleAddStep}
                  onDeleteStep={handleDeleteStep}
                  onToggleStep={handleToggleStep}
                  onReorderSteps={handleReorderSteps}
                  onLinkStepToSpec={handleLinkStepToSpec}
                />
            </TabContentWrapper>
            <TabContentWrapper title="規格 (Specs)">
              <SpecsTab 
                specs={specs} 
                onSpecChange={handleSpecChange} 
                onAddSpec={handleAddSpec}
                onDeleteSpec={handleDeleteSpec}
                onAddSpecItem={handleAddSpecItem}
                onDeleteSpecItem={handleDeleteSpecItem}
                onSpecItemKeyChange={handleSpecItemKeyChange}
                onReorderSpecs={handleReorderSpecs}
              />
            </TabContentWrapper>
          </div>
          
          <div className={activeTab === '與會人員 (Attendees)' ? '' : 'hidden print-show'}>
             <TabContentWrapper title="與會人員 (Attendees)">
                <AttendeesTab 
                  attendees={attendees}
                  onAttendeesChange={handleAttendeesChange}
                  date={meetingDate}
                  onDateChange={handleMeetingDateChange}
                />
            </TabContentWrapper>
          </div>

        </main>
      </div>
    </div>
  );
};

export default App;
