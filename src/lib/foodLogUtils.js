/* =========================================================
   FOOD LOG & MEAL UTILITIES
   ========================================================= */

/**
 * Returns a date string formatted as YYYY-MM-DD using local time.
 * @param {number} offsetDays - Number of days to subtract from current date
 * @returns {string} Date string in YYYY-MM-DD format
 */
export function getLocalDateStr(offsetDays = 0) {
  const now = new Date();
  if (offsetDays !== 0) {
    now.setDate(now.getDate() - offsetDays);
  }
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Groups an array of food log items into meals by meal_group_id.
 * Falls back to timestamp batch key or single item ID if meal_group_id is absent.
 * @param {Array} foodList - Array of food log objects
 * @returns {Array<Array>} Array of food log arrays, grouped by meal
 */
export function groupFoodsByMeal(foodList) {
  if (!Array.isArray(foodList) || foodList.length === 0) return [];
  const map = new Map();
  for (const item of foodList) {
    let key = item.meal_group_id;
    if (!key && item.created_at) {
      key = `batch-${String(item.created_at).slice(0, 16)}`;
    }
    if (!key) {
      key = `single-${item.id || Math.random()}`;
    }

    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key).push(item);
  }
  return Array.from(map.values());
}
