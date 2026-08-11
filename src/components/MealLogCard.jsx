import React, { useState } from 'react';

export default function MealLogCard({ items, dateLabel }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!items || items.length === 0) return null;

  // Calculate meal totals
  const totalCalories = Math.round(
    items.reduce((sum, item) => sum + (Number(item.calories) || 0), 0)
  );
  const totalProtein = Math.round(
    items.reduce((sum, item) => sum + (Number(item.protein) || 0), 0)
  );
  const totalCarbs = Math.round(
    items.reduce((sum, item) => sum + (Number(item.carbs) || 0), 0)
  );
  const totalFat = Math.round(
    items.reduce((sum, item) => sum + (Number(item.fat) || 0), 0)
  );

  // Meal Title formatting
  const mealTitle =
    items.length === 1
      ? items[0].food_name
      : `${items[0].food_name} + ${items.length - 1} other item${items.length > 2 ? 's' : ''}`;

  // Formatted date/time
  const displayTime = dateLabel || (items[0].created_at
    ? new Date(items[0].created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : items[0].log_date);

  return (
    <div className="glass-card p-4 sm:p-5 rounded-2xl transition-all">
      {/* Collapsed Header Bar */}
      <div
        className="flex items-center justify-between gap-3 cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base">🍽</span>
            <h3 className="text-sm sm:text-base font-bold text-[#10241E] truncate max-w-[200px] sm:max-w-xs">
              {mealTitle}
            </h3>
            {items.length > 1 && (
              <span className="text-[11px] font-semibold text-[#1F9E76] bg-[#1F9E76]/12 px-2 py-0.5 rounded-full whitespace-nowrap">
                {items.length} items
              </span>
            )}
          </div>
          <div className="text-xs text-[#5B6B65]">{displayTime}</div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <div className="font-mono text-sm sm:text-base font-bold text-[#FF8F6B] bg-[#FF8F6B]/12 px-2.5 sm:px-3 py-1 rounded-full whitespace-nowrap">
            {totalCalories} <span className="text-[11px] font-normal">kcal</span>
          </div>

          <button
            type="button"
            className="w-7 h-7 rounded-full bg-[#10241E]/6 text-[#10241E] flex items-center justify-center text-xs font-bold hover:bg-[#10241E]/10 transition-colors cursor-pointer"
            aria-label={isExpanded ? "Collapse meal" : "Expand meal"}
          >
            {isExpanded ? '▴' : '▾'}
          </button>
        </div>
      </div>

      {/* Macro Summary Strip */}
      <div className="flex flex-wrap gap-2 mt-3 text-xs text-[#5B6B65]">
        <span className="bg-[#10241E]/4 px-2.5 py-1 rounded-lg">
          <strong className="text-[#10241E] font-semibold">{totalProtein}g</strong> Protein
        </span>
        <span className="bg-[#10241E]/4 px-2.5 py-1 rounded-lg">
          <strong className="text-[#10241E] font-semibold">{totalCarbs}g</strong> Carbs
        </span>
        <span className="bg-[#10241E]/4 px-2.5 py-1 rounded-lg">
          <strong className="text-[#10241E] font-semibold">{totalFat}g</strong> Fat
        </span>
      </div>

      {/* Expanded Item Breakdown */}
      {isExpanded && (
        <div className="mt-3">
          <div className="h-px bg-[#10241E]/8 my-3" />
          <div className="text-[11px] font-bold text-[#1F9E76] uppercase tracking-wider mb-2">
            Itemized Breakdown
          </div>
          <div className="flex flex-col gap-2">
            {items.map((item, idx) => (
              <div
                key={item.id || `${item.food_name}-${idx}`}
                className="flex items-center justify-between gap-2 p-2 sm:p-2.5 rounded-lg bg-white/75"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-[#1F9E76] text-xs">•</span>
                  <span className="text-xs sm:text-sm font-semibold text-[#10241E] truncate">
                    {item.food_name}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-mono shrink-0">
                  <span className="text-[#FF8F6B] font-semibold">
                    {Math.round(item.calories || 0)} kcal
                  </span>
                  <span className="text-[#5B6B65]">
                    {Math.round(item.protein || 0)}g P
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

