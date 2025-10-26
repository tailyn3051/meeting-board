import React from 'react';
import { ScheduleTask } from '../types.ts';
import EditableField from './EditableField.tsx';

interface ScheduleTabProps {
  tasks: ScheduleTask[];
  onTaskChange: (taskIndex: number, key: keyof ScheduleTask, value: string) => void;
}

const ScheduleTab: React.FC<ScheduleTabProps> = ({ tasks, onTaskChange }) => {
  return (
    <section>
      <p className="text-base text-gray-700 dark:text-slate-300 mb-6">
        此為詳細的 NPI 試產任務時程表，包含所有關鍵日期、任務、QC 檢查點與最終交付物。
      </p>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-amber-100 dark:border-slate-700 overflow-hidden print:break-inside-avoid">
        <div className="overflow-x-auto print:overflow-visible">
          <table className="w-full min-w-[600px] print:min-w-full text-left">
            <thead className="bg-amber-100 dark:bg-slate-700/50 border-b border-amber-200 dark:border-slate-600">
              <tr>
                <th className="p-4 font-semibold text-amber-900 dark:text-amber-400">日期</th>
                <th className="p-4 font-semibold text-amber-900 dark:text-amber-400">星期</th>
                <th className="p-4 font-semibold text-amber-900 dark:text-amber-400">任務 / 事件</th>
                <th className="p-4 font-semibold text-amber-900 dark:text-amber-400">備註</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-100 dark:divide-slate-700">
              {tasks.map((task, index) => {
                const showDate = index === 0 || tasks[index - 1].date !== task.date;
                return (
                  <tr key={index} className="hover:bg-amber-50/70 dark:hover:bg-slate-700/50">
                    <td className="p-4 align-top">
                      {showDate && (
                        <EditableField 
                          as="div" 
                          initialValue={task.date} 
                          onSave={(v) => onTaskChange(index, 'date', v)} 
                          className="font-semibold text-gray-900 dark:text-slate-200"
                        />
                      )}
                    </td>
                    <td className="p-4 align-top">
                      {showDate && (
                        <EditableField 
                          as="div" 
                          initialValue={task.day} 
                          onSave={(v) => onTaskChange(index, 'day', v)}
                          className="text-gray-900 dark:text-slate-200"
                        />
                      )}
                    </td>
                    <td className={`p-4 align-top font-medium ${task.highlight || 'text-gray-800 dark:text-slate-300'}`}>
                      <EditableField as="div" initialValue={task.task} onSave={(v) => onTaskChange(index, 'task', v)} />
                    </td>
                    <td className={`p-4 align-top ${task.highlight?.includes('red') ? 'font-bold text-red-700 dark:text-red-500' : 'text-gray-800 dark:text-slate-300'}`}>
                      <EditableField as="div" initialValue={task.notes} onSave={(v) => onTaskChange(index, 'notes', v)} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default ScheduleTab;
