import React, { useState } from 'react';

export default function NutritionCalendar({
  foodLogs = [],
  activeTarget = null,
  userCreatedAt = null,
  currentDate = new Date(),
}) {
  const [selectedDay, setSelectedDay] = useState(null);

  const today = currentDate;
  const year = today.getFullYear();
  const month = today.getMonth(); // 0-indexed
  const monthName = today
    .toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    .toUpperCase();

  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 (Sun) to 6 (Sat)
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Format signup date YYYY-MM-DD
  let signupDateStr = '';
  if (userCreatedAt) {
    const d = new Date(userCreatedAt);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    signupDateStr = `${y}-${m}-${day}`;
  }

  const todayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const targetCals = Number(activeTarget?.calories) || 2000;

  // Generate calendar days
  const calendarDays = [];

  // Padded empty cells before 1st of month
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push({ type: 'empty', id: `empty-${i}` });
  }

  // Days of month
  for (let d = 1; d <= daysInMonth; d++) {
    const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayLogs = foodLogs.filter((log) => log.log_date === dayStr);
    const dayCalories = Math.round(
      dayLogs.reduce((sum, item) => sum + (Number(item.calories) || 0), 0)
    );

    let status = 'neutral';
    let statusText = 'No info';

    if (signupDateStr && dayStr < signupDateStr) {
      status = 'neutral';
      statusText = 'Pre-signup';
    } else if (dayStr > todayStr) {
      status = 'neutral';
      statusText = 'Upcoming';
    } else {
      if (dayCalories === 0) {
        status = 'red';
        statusText = 'Missed';
      } else {
        const ratio = dayCalories / targetCals;
        if (ratio >= 0.85 && ratio <= 1.15) {
          status = 'green';
          statusText = 'On Track';
        } else if (
          (ratio >= 0.60 && ratio < 0.85) ||
          (ratio > 1.15 && ratio <= 1.40)
        ) {
          status = 'orange';
          statusText = 'Slightly Off';
        } else {
          status = 'red';
          statusText = 'Off Target';
        }
      }
    }

    const isToday = dayStr === todayStr;

    calendarDays.push({
      type: 'day',
      dayNumber: d,
      dayStr,
      dayCalories,
      status,
      statusText,
      isToday,
      itemCount: dayLogs.length,
    });
  }

  const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div className="glass-card p-4 sm:p-6 rounded-2xl font-body">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
        <div>
          <span className="text-[#1F9E76] text-[11px] font-bold tracking-wider uppercase">CALENDAR LOG</span>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-[#10241E] mt-0.5">{monthName}</h2>
        </div>
        <div className="text-xs sm:text-sm text-[#5B6B65] bg-white/80 px-3.5 py-1.5 rounded-full border border-[#10241E]/8 self-start sm:self-auto">
          Target: <strong className="text-[#10241E]">{targetCals} kcal/day</strong>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center">
        {weekdays.map((day) => (
          <div key={day} className="text-[11px] sm:text-xs font-bold text-[#5B6B65] uppercase">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {calendarDays.map((cell) => {
          if (cell.type === 'empty') {
            return <div key={cell.id} className="h-9 sm:h-11" />;
          }

          let cellBg = 'bg-[#10241E]/4';
          let cellBorder = 'border border-[#10241E]/8';
          let textColor = 'text-[#5B6B65]';
          let dotColor = 'bg-transparent';

          if (cell.status === 'green') {
            cellBg = 'bg-[#1F9E76]/15';
            cellBorder = 'border border-[#1F9E76]/40';
            textColor = 'text-[#10241E]';
            dotColor = 'bg-[#1F9E76]';
          } else if (cell.status === 'orange') {
            cellBg = 'bg-[#FF8F6B]/18';
            cellBorder = 'border border-[#FF8F6B]/50';
            textColor = 'text-[#10241E]';
            dotColor = 'bg-[#FF8F6B]';
          } else if (cell.status === 'red') {
            cellBg = 'bg-red-500/15';
            cellBorder = 'border border-red-500/40';
            textColor = 'text-red-600';
            dotColor = 'bg-red-500';
          }

          const isSelected = selectedDay?.dayStr === cell.dayStr;

          return (
            <div
              key={cell.dayStr}
              onClick={() => setSelectedDay(cell)}
              className={`h-9 sm:h-11 rounded-lg sm:rounded-xl flex flex-col items-center justify-center cursor-pointer relative transition-all select-none ${cellBg} ${cellBorder} ${textColor} ${
                cell.isToday
                  ? "ring-2 ring-[#1F9E76] shadow-md font-extrabold"
                  : ""
              } ${isSelected ? "scale-105 z-10" : ""}`}
              title={`${cell.dayStr}: ${cell.dayCalories} kcal logged (${cell.statusText})`}
            >
              <span className="text-xs sm:text-sm font-semibold">{cell.dayNumber}</span>
              {cell.status !== 'neutral' && (
                <span
                  className={`w-1.5 h-1.5 rounded-full absolute bottom-1 ${dotColor}`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Day Info Popup Banner */}
      {selectedDay && (
        <div className="mt-4 p-3 sm:p-3.5 rounded-xl bg-[#10241E]/6 flex items-center justify-between gap-2 text-xs sm:text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-[#10241E]">{selectedDay.dayStr}</span>
            <span className="text-[#5B6B65]">
              {selectedDay.statusText} • {selectedDay.dayCalories} / {targetCals} kcal
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSelectedDay(null)}
            className="text-[#5B6B65] hover:text-[#10241E] font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-5 pt-4 border-t border-[#10241E]/8 text-xs text-[#5B6B65]">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#1F9E76]" />
          <span>On Track (85-115%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#FF8F6B]" />
          <span>Slightly Off</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <span>Missed / Off Target</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#10241E]/20" />
          <span>Pre-signup / Future</span>
        </div>
      </div>
    </div>
  );
}

