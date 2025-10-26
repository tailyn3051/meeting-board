import React from 'react';
import { ProjectDetails, GanttTask } from '../types.ts';
import Card from './Card.tsx';
import GanttChart from './GanttChart.tsx';
import EditableField from './EditableField.tsx';

interface OverviewTabProps {
  details: ProjectDetails;
  tasks: GanttTask[];
  onDetailChange: (key: keyof ProjectDetails, value: string) => void;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ details, tasks, onDetailChange }) => {
  return (
    <section className="space-y-6">
      <p className="text-base text-gray-700 dark:text-slate-300">
        此儀表板整合了 {details.id} NPI 試產的關鍵資訊。您可以在此查看專案的總體概況、關鍵指標以及高階時程。使用上方的頁籤來深入了解特定的規格、製造流程或詳細的任務列表。
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card title="專案料號">
          <EditableField 
            initialValue={details.id} 
            onSave={(value) => onDetailChange('id', value)} 
            className="text-2xl font-semibold text-amber-900 dark:text-amber-400" 
          />
        </Card>
        <Card title="試產數量">
          <EditableField 
            initialValue={`${details.quantity} pcs`} 
            onSave={(value) => onDetailChange('quantity', value.replace(' pcs', '').trim())} 
            className="text-2xl font-semibold text-amber-900 dark:text-amber-400" 
          />
        </Card>
        <Card title="PCB 尺寸 (mm)">
          <EditableField 
            initialValue={details.pcbSize} 
            onSave={(value) => onDetailChange('pcbSize', value)} 
            className="text-lg font-semibold text-amber-900 dark:text-amber-400" 
          />
        </Card>
        <Card title="目標出貨日" className="border-red-100 dark:border-red-500/20">
          <EditableField 
            type="date"
            initialValue={details.targetShipDate} 
            onSave={(value) => onDetailChange('targetShipDate', value)} 
            className="text-2xl font-semibold text-red-700 dark:text-red-500"
          />
        </Card>
      </div>
      <div className="bg-white dark:bg-slate-800/50 p-4 md:p-6 rounded-lg shadow-md border border-amber-100 dark:border-slate-700 print:break-inside-avoid">
        <h2 className="text-xl font-semibold mb-4 text-amber-900 dark:text-amber-400">專案階段時程</h2>
        <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
          此甘特圖顯示了 NPI 試產的主要階段與預計時程，並會根據“時程與任務”頁籤中的日期自動更新。
        </p>
        <GanttChart data={tasks} />
      </div>
    </section>
  );
};

export default OverviewTab;
