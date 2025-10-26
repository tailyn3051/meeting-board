import React, { useState } from 'react';
import { ProcessStep } from '../types.ts';

interface CalendarProps {
  events?: ProcessStep[];
  onDateClick: (date: Date) => void;
  selectedDate: Date | null;
  showEvents?: boolean;
}

const Calendar: React.FC<CalendarProps> = ({ events = [], onDateClick, selectedDate, showEvents = true }) => {
  const [currentDate, setCurrentDate] = useState(selectedDate || new Date());

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const today = new Date();
  const isToday = (day: number) => 
    today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;

  const isEventDay = (day: number) => {
    if (!showEvents) return false;
    const checkDate = new Date(year, month, day);
    checkDate.setHours(0, 0, 0, 0);

    return events.some(event => {
      if (!event.startDate || !event.endDate) return false;
      try {
        const startDate = new Date(event.startDate);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(event.endDate);
        endDate.setHours(0, 0, 0, 0);
        return checkDate >= startDate && checkDate <= endDate;
      } catch {
        return false;
      }
    });
  };

  const isSelectedDay = (day: number) => {
    if (!selectedDate) return false;
    return selectedDate.getDate() === day &&
           selectedDate.getMonth() === month &&
           selectedDate.getFullYear() === year;
  }

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="p-2"></div>);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const isEvent = isEventDay(day);
    const isCurrent = isToday(day);
    const isSelected = isSelectedDay(day);

    let dayClass = 'p-2 flex items-center justify-center h-10 w-10 rounded-full cursor-pointer transition-colors duration-200';
    if (isEvent) {
      dayClass += ' bg-amber-500 text-white font-bold';
    } else if (isCurrent) {
      dayClass += ' bg-amber-200 dark:bg-amber-500/30 text-amber-900 dark:text-amber-300 font-bold';
    } else {
      dayClass += ' text-gray-700 dark:text-slate-300 hover:bg-amber-100 dark:hover:bg-slate-700';
    }
    if (isSelected) {
      dayClass += ' ring-2 ring-blue-500 ring-offset-1';
    }

    days.push(
      <button
        key={day}
        onClick={() => onDateClick(new Date(year, month, day))}
        className={dayClass}
      >
        {day}
      </button>
    );
  }

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors">&larr;</button>
        <div className="font-bold text-lg text-amber-800 dark:text-amber-400">{`${monthName} ${year}`}</div>
        <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors">&rarr;</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-gray-500 dark:text-slate-400">
        {weekdays.map(day => <div key={day} className="py-2">{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1 mt-2 text-center">
        {days}
      </div>
    </div>
  );
};

export default Calendar;
