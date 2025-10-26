import React from 'react';
import EditableField from './EditableField.tsx';

interface AttendeesTabProps {
  attendees: string[];
  onAttendeesChange: (value: string) => void;
  date: string;
  onDateChange: (value: string) => void;
}

const AttendeesTab: React.FC<AttendeesTabProps> = ({ attendees, onAttendeesChange, date, onDateChange }) => {
  return (
    <section className="space-y-6">
      <p className="text-base text-gray-700 dark:text-slate-300">
        請在此處列出本次會議的與會人員，每行一位。
      </p>
      <div className="bg-white dark:bg-slate-800/50 p-6 rounded-lg shadow-md border border-amber-100 dark:border-slate-700">
        <div className="flex justify-start items-center gap-x-8 mb-4">
            <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-400">與會人員 (Attendees)</h3>
            <div className="flex items-center">
                <span className="text-gray-600 dark:text-slate-400 mr-2 whitespace-nowrap">會議日期:</span>
                <EditableField
                    type="date"
                    initialValue={date}
                    onSave={onDateChange}
                    className="font-semibold text-amber-900 dark:text-amber-400"
                />
            </div>
        </div>
        <EditableField
          as="div"
          initialValue={attendees.join('\n')}
          onSave={onAttendeesChange}
          className="mt-1 p-2 border rounded-md w-full bg-amber-50 dark:bg-slate-700/50 min-h-[200px]"
          inputClassName="p-2"
        />
      </div>
    </section>
  );
};

export default AttendeesTab;
