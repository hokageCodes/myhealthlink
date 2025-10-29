'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Calendar({ appointments = [], onDateSelect, onAppointmentClick, selectedDate }) {
  const [currentDate, setCurrentDate] = useState(selectedDate || new Date());

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    // Empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };

  const getAppointmentsForDate = (date) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return appointments.filter(apt => apt.date === dateStr);
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    if (!date) return false;
    return date.toDateString() === selectedDate?.toDateString();
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleDateClick = (date) => {
    if (!date) return;
    setCurrentDate(date);
    if (onDateSelect) onDateSelect(date);
  };

  const days = getDaysInMonth(currentDate);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="bg-white dark:bg-surface-800 rounded-xl p-6 border border-surface-200 dark:border-surface-700 shadow-medium">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-2 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-surface-600 dark:text-surface-400" />
        </button>
        
        <h3 className="text-lg font-semibold text-surface-900 dark:text-white">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        
        <button
          onClick={() => navigateMonth('next')}
          className="p-2 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-surface-600 dark:text-surface-400" />
        </button>
      </div>

      {/* Week Day Headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map(day => (
          <div
            key={day}
            className="text-center text-sm font-medium text-surface-600 dark:text-surface-400"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const dayAppointments = getAppointmentsForDate(date);
          const hasAppointments = dayAppointments.length > 0;
          const isCurrentDay = isToday(date);
          const isSelectedDay = isSelected(date);

          return (
            <button
              key={date.toISOString()}
              onClick={() => handleDateClick(date)}
              className={`aspect-square p-2 rounded-lg text-sm font-medium transition-colors relative ${
                isSelectedDay
                  ? 'bg-brand-600 text-white'
                  : isCurrentDay
                  ? 'bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300'
                  : 'hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-900 dark:text-white'
              }`}
            >
              <span>{date.getDate()}</span>
              {hasAppointments && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-0.5">
                  {dayAppointments.slice(0, 3).map((apt, idx) => (
                    <div
                      key={idx}
                      className={`w-1 h-1 rounded-full ${
                        isSelectedDay ? 'bg-white' : 'bg-brand-600'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onAppointmentClick) onAppointmentClick(apt);
                      }}
                    />
                  ))}
                  {dayAppointments.length > 3 && (
                    <div
                      className={`text-[8px] ${
                        isSelectedDay ? 'text-white' : 'text-brand-600'
                      }`}
                    >
                      +{dayAppointments.length - 3}
                    </div>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
