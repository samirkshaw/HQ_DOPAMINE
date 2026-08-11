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
    <div style={styles.card}>
      <div style={styles.header}>
        <div>
          <span style={styles.eyebrow}>CALENDAR LOG</span>
          <h2 style={styles.title}>{monthName}</h2>
        </div>
        <div style={styles.targetBadge}>
          Target: <strong>{targetCals} kcal/day</strong>
        </div>
      </div>

      {/* Weekday Labels */}
      <div style={styles.weekdaysRow}>
        {weekdays.map((day) => (
          <div key={day} style={styles.weekdayLabel}>
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div style={styles.daysGrid}>
        {calendarDays.map((cell) => {
          if (cell.type === 'empty') {
            return <div key={cell.id} style={styles.emptyCell} />;
          }

          let cellBg = 'rgba(16, 36, 30, 0.04)';
          let cellBorder = '1px solid rgba(16, 36, 30, 0.08)';
          let textColor = '#5B6B65';
          let dotColor = 'transparent';

          if (cell.status === 'green') {
            cellBg = 'rgba(31, 158, 118, 0.15)';
            cellBorder = '1px solid rgba(31, 158, 118, 0.4)';
            textColor = '#10241E';
            dotColor = '#1F9E76';
          } else if (cell.status === 'orange') {
            cellBg = 'rgba(255, 143, 107, 0.18)';
            cellBorder = '1px solid rgba(255, 143, 107, 0.5)';
            textColor = '#10241E';
            dotColor = '#FF8F6B';
          } else if (cell.status === 'red') {
            cellBg = 'rgba(239, 68, 68, 0.15)';
            cellBorder = '1px solid rgba(239, 68, 68, 0.4)';
            textColor = '#dc2626';
            dotColor = '#ef4444';
          }

          const isSelected = selectedDay?.dayStr === cell.dayStr;

          return (
            <div
              key={cell.dayStr}
              onClick={() => setSelectedDay(cell)}
              style={{
                ...styles.dayCell,
                backgroundColor: cellBg,
                border: cellBorder,
                color: textColor,
                ...(cell.isToday
                  ? {
                      boxShadow: '0 0 0 3px #1F9E76, 0 4px 12px rgba(31, 158, 118, 0.3)',
                      fontWeight: '800',
                    }
                  : {}),
                ...(isSelected ? { transform: 'scale(1.08)', zIndex: 2 } : {}),
              }}
              title={`${cell.dayStr}: ${cell.dayCalories} kcal logged (${cell.statusText})`}
            >
              <span style={styles.dayNumber}>{cell.dayNumber}</span>
              {cell.status !== 'neutral' && (
                <span
                  style={{
                    ...styles.statusDot,
                    backgroundColor: dotColor,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Day Info Popup Banner */}
      {selectedDay && (
        <div style={styles.selectedBanner}>
          <div style={styles.selectedLeft}>
            <span style={styles.selectedDate}>{selectedDay.dayStr}</span>
            <span style={styles.selectedStatus}>
              {selectedDay.statusText} • {selectedDay.dayCalories} / {targetCals} kcal
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSelectedDay(null)}
            style={styles.closeBtn}
          >
            ✕
          </button>
        </div>
      )}

      {/* Legend */}
      <div style={styles.legendRow}>
        <div style={styles.legendItem}>
          <span style={{ ...styles.legendDot, backgroundColor: '#1F9E76' }} />
          <span>On Track (85-115%)</span>
        </div>
        <div style={styles.legendItem}>
          <span style={{ ...styles.legendDot, backgroundColor: '#FF8F6B' }} />
          <span>Slightly Off</span>
        </div>
        <div style={styles.legendItem}>
          <span style={{ ...styles.legendDot, backgroundColor: '#ef4444' }} />
          <span>Missed / Off Target</span>
        </div>
        <div style={styles.legendItem}>
          <span style={{ ...styles.legendDot, backgroundColor: 'rgba(16, 36, 30, 0.2)' }} />
          <span>Pre-signup / Future</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    padding: '24px',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.9)',
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    boxShadow: '0 12px 32px rgba(16, 36, 30, 0.06)',
    fontFamily: 'var(--font-body)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  eyebrow: {
    color: '#1F9E76',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '1.5px',
  },
  title: {
    margin: '4px 0 0',
    fontFamily: 'var(--font-display)',
    fontSize: '24px',
    fontWeight: '700',
    color: '#10241E',
  },
  targetBadge: {
    fontSize: '13px',
    color: '#5B6B65',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: '6px 14px',
    borderRadius: '999px',
    border: '1px solid rgba(16, 36, 30, 0.08)',
  },
  weekdaysRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '8px',
    marginBottom: '10px',
    textAlign: 'center',
  },
  weekdayLabel: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#5B6B65',
    textTransform: 'uppercase',
  },
  daysGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '8px',
  },
  emptyCell: {
    height: '44px',
  },
  dayCell: {
    height: '44px',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    position: 'relative',
    transition: 'all 0.2s ease',
    userSelect: 'none',
  },
  dayNumber: {
    fontSize: '14px',
    fontWeight: '600',
  },
  statusDot: {
    width: '5px',
    height: '5px',
    borderRadius: '50%',
    position: 'absolute',
    bottom: '5px',
  },
  selectedBanner: {
    marginTop: '16px',
    padding: '12px 16px',
    borderRadius: '12px',
    backgroundColor: 'rgba(16, 36, 30, 0.06)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedLeft: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  selectedDate: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#10241E',
  },
  selectedStatus: {
    fontSize: '13px',
    color: '#5B6B65',
  },
  closeBtn: {
    border: 'none',
    background: 'none',
    color: '#5B6B65',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  legendRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    marginTop: '20px',
    paddingTop: '16px',
    borderTop: '1px solid rgba(16, 36, 30, 0.08)',
    fontSize: '12px',
    color: '#5B6B65',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  legendDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
};
