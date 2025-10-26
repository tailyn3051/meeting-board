import React from 'react';
import { GanttTask } from '../types.ts';

interface GanttChartProps {
  data: GanttTask[];
}

const GanttChart: React.FC<GanttChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="text-center text-gray-500 dark:text-slate-400">No task data available for the Gantt chart.</div>;
  }

  const minDate = new Date(Math.min(...data.map(task => task.start.getTime())));
  const maxDate = new Date(Math.max(...data.map(task => task.end.getTime())));
  
  minDate.setDate(minDate.getDate() - 2);
  maxDate.setDate(maxDate.getDate() + 2);

  const totalDays = (maxDate.getTime() - minDate.getTime()) / (1000 * 3600 * 24);

  if (totalDays <= 0) {
    return <div className="text-center text-gray-500 dark:text-slate-400">Invalid date range for Gantt chart.</div>;
  }

  const getDaysFromStart = (date: Date) => {
    return (date.getTime() - minDate.getTime()) / (1000 * 3600 * 24);
  };

  const colors = ['bg-amber-500', 'bg-blue-500', 'bg-green-500', 'bg-red-500', 'bg-purple-500', 'bg-yellow-500'];

  const formatDate = (date: Date) => date.toLocaleDateString();

  return (
    <div className="relative font-sans text-sm">
      {/* Visual chart for screen */}
      <div className="print:hidden">
        <div className="grid gap-y-2">
          {data.map((task, index) => {
              const leftPercentage = (getDaysFromStart(task.start) / totalDays) * 100;
              const widthPercentage = ((task.end.getTime() - task.start.getTime()) / (1000 * 3600 * 24) / totalDays) * 100;

              return (
                <div key={task.name} className="flex items-center h-10">
                  <div className="w-40 pr-4 text-right text-gray-700 dark:text-slate-300 truncate">{task.name}</div>
                  <div className="flex-1 bg-gray-200 dark:bg-slate-700 rounded-lg h-6 relative overflow-hidden">
                    <div
                      className={`absolute h-full rounded-lg ${colors[index % colors.length]}`}
                      style={{
                        left: `${leftPercentage}%`,
                        width: `${widthPercentage}%`,
                      }}
                    >
                      <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-semibold px-2 truncate">
                        {task.name}
                      </span>
                    </div>
                  </div>
                </div>
              );
          })}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-slate-400">
          <span>{minDate.toLocaleDateString()}</span>
          <span>{maxDate.toLocaleDateString()}</span>
        </div>
      </div>

      {/* Simplified list for printing */}
      <div className="hidden print:block">
        <h4 className="font-bold mb-2">Task Summary:</h4>
        <ul className="list-disc list-inside">
          {data.map((task, index) => (
            <li key={`print-${index}`}>
              <strong>{task.name}:</strong> {formatDate(task.start)} to {formatDate(task.end)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default GanttChart;
