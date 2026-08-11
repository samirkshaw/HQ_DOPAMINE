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
    <div style={styles.card}>
      {/* Collapsed Header Bar */}
      <div
        style={styles.headerRow}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div style={styles.headerLeft}>
          <div style={styles.titleRow}>
            <span style={styles.mealIcon}>🍽</span>
            <h3 style={styles.mealTitle}>{mealTitle}</h3>
            {items.length > 1 && (
              <span style={styles.itemCountBadge}>{items.length} items</span>
            )}
          </div>
          <div style={styles.timeLabel}>{displayTime}</div>
        </div>

        <div style={styles.headerRight}>
          <div style={styles.caloriesPill}>
            {totalCalories} <span style={{ fontSize: '11px' }}>kcal</span>
          </div>

          <button
            type="button"
            style={styles.toggleBtn}
            aria-label={isExpanded ? "Collapse meal" : "Expand meal"}
          >
            {isExpanded ? '▴' : '▾'}
          </button>
        </div>
      </div>

      {/* Macro Summary Strip */}
      <div style={styles.macroSummaryStrip}>
        <span style={styles.macroTag}>
          <strong>{totalProtein}g</strong> Protein
        </span>
        <span style={styles.macroTag}>
          <strong>{totalCarbs}g</strong> Carbs
        </span>
        <span style={styles.macroTag}>
          <strong>{totalFat}g</strong> Fat
        </span>
      </div>

      {/* Expanded Item Breakdown */}
      {isExpanded && (
        <div style={styles.expandedSection}>
          <div style={styles.divider} />
          <div style={styles.itemListTitle}>Itemized Breakdown</div>
          <div style={styles.itemList}>
            {items.map((item, idx) => (
              <div key={item.id || `${item.food_name}-${idx}`} style={styles.itemRow}>
                <div style={styles.itemNameGroup}>
                  <span style={styles.itemDot}>•</span>
                  <span style={styles.itemName}>{item.food_name}</span>
                </div>
                <div style={styles.itemNutrients}>
                  <span style={styles.itemCal}>{Math.round(item.calories || 0)} kcal</span>
                  <span style={styles.itemProt}>
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

const styles = {
  card: {
    padding: '18px 20px',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.9)',
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    boxShadow: '0 4px 16px rgba(16, 36, 30, 0.04)',
    transition: 'all 0.2s ease',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    userSelect: 'none',
  },
  headerLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  mealIcon: {
    fontSize: '16px',
  },
  mealTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '700',
    color: '#10241E',
    fontFamily: 'var(--font-body)',
  },
  itemCountBadge: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#1F9E76',
    backgroundColor: 'rgba(31, 158, 118, 0.12)',
    padding: '2px 8px',
    borderRadius: '999px',
  },
  timeLabel: {
    fontSize: '12px',
    color: '#5B6B65',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  caloriesPill: {
    fontFamily: 'var(--font-mono)',
    fontSize: '16px',
    fontWeight: '700',
    color: '#FF8F6B',
    backgroundColor: 'rgba(255, 143, 107, 0.12)',
    padding: '4px 12px',
    borderRadius: '999px',
    whiteSpace: 'nowrap',
  },
  toggleBtn: {
    border: 'none',
    background: 'rgba(16, 36, 30, 0.06)',
    color: '#10241E',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  macroSummaryStrip: {
    display: 'flex',
    gap: '12px',
    marginTop: '12px',
    fontSize: '12px',
    color: '#5B6B65',
  },
  macroTag: {
    backgroundColor: 'rgba(16, 36, 30, 0.04)',
    padding: '4px 10px',
    borderRadius: '8px',
  },
  expandedSection: {
    marginTop: '12px',
  },
  divider: {
    height: '1px',
    backgroundColor: 'rgba(16, 36, 30, 0.08)',
    margin: '12px 0',
  },
  itemListTitle: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#1F9E76',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    marginBottom: '8px',
  },
  itemList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  itemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 10px',
    borderRadius: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
  },
  itemNameGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  itemDot: {
    color: '#1F9E76',
  },
  itemName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#10241E',
  },
  itemNutrients: {
    display: 'flex',
    gap: '10px',
    fontSize: '12px',
    fontFamily: 'var(--font-mono)',
  },
  itemCal: {
    color: '#FF8F6B',
    fontWeight: '600',
  },
  itemProt: {
    color: '#5B6B65',
  },
};
