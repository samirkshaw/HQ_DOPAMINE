import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import UploadPhoto from "../components/UploadPhoto";
import MealLogCard from "../components/MealLogCard";
import { getLocalDateStr, groupFoodsByMeal } from "../lib/foodLogUtils";

const styles = `
  .hq-log-page {
    min-height: calc(100vh - 64px);
    box-sizing: border-box;
    padding: 42px 24px 80px;
    color: #10241E;
    font-family: var(--font-body);
  }

  .hq-log-container {
    width: 100%;
    max-width: 728px;
    margin: 0 auto;
  }

  .hq-log-header {
    margin-bottom: 26px;
  }

  .hq-log-eyebrow {
    margin-bottom: 8px;
    color: #1F9E76;
    fontSize: 12px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
  }

  .hq-log-title {
    margin: 0;
    color: #10241E;
    font-family: var(--font-display);
    font-size: 36px;
    line-height: 1.1;
    font-weight: 700;
    letter-spacing: -0.5px;
  }

  .hq-log-subtitle {
    margin: 10px 0 0;
    color: #5B6B65;
    font-size: 15px;
    line-height: 1.5;
  }

  .hq-food-form {
    box-sizing: border-box;
    width: 100%;
    padding: 28px;
    border: 1px solid rgba(255, 255, 255, 0.9);
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.65);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    box-shadow: 0 12px 32px rgba(16, 36, 30, 0.06);
  }

  .hq-form-group {
    margin-bottom: 18px;
  }

  .hq-form-label {
    display: block;
    margin-bottom: 8px;
    color: #10241E;
    font-size: 13px;
    font-weight: 600;
  }

  .hq-form-input {
    box-sizing: border-box;
    width: 100%;
    height: 44px;
    padding: 0 14px;
    border: 1px solid rgba(16, 36, 30, 0.12);
    border-radius: 12px;
    outline: none;
    background: rgba(255, 255, 255, 0.85);
    color: #10241E;
    font-family: inherit;
    font-size: 14px;
    transition: all 0.2s;
  }

  .hq-form-input::placeholder {
    color: #5B6B65;
  }

  .hq-form-input:focus {
    border-color: #1F9E76;
    box-shadow: 0 0 0 3px rgba(31, 158, 118, 0.2);
  }

  .hq-form-input:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  .hq-nutrition-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
  }

  .hq-save-button {
    width: 100%;
    height: 46px;
    margin-top: 6px;
    border: none;
    border-radius: 999px;
    background: #1F9E76;
    color: #ffffff;
    font-family: inherit;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(31, 158, 118, 0.25);
    transition: all 0.2s ease;
  }

  .hq-save-button:hover:not(:disabled) {
    background: #178361;
    transform: translateY(-1px);
    box-shadow: 0 6px 18px rgba(31, 158, 118, 0.35);
  }

  .hq-save-button:disabled {
    cursor: not-allowed;
    opacity: 0.65;
  }

  .hq-message {
    margin-top: 14px;
    padding: 12px;
    border-radius: 10px;
    font-size: 13px;
    line-height: 1.4;
    text-align: center;
  }

  .hq-success-message {
    border: 1px solid rgba(31, 158, 118, 0.25);
    background: rgba(31, 158, 118, 0.1);
    color: #1F9E76;
  }

  .hq-error-message {
    border: 1px solid rgba(239, 68, 68, 0.25);
    background: rgba(239, 68, 68, 0.1);
    color: #dc2626;
  }

  .hq-recent-section {
    margin-top: 36px;
  }

  .hq-recent-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .hq-recent-title {
    margin: 0;
    color: #10241E;
    font-family: var(--font-display);
    font-size: 24px;
    font-weight: 700;
  }

  .hq-entry-count {
    color: #5B6B65;
    font-size: 13px;
  }

  .hq-empty-foods {
    box-sizing: border-box;
    width: 100%;
    min-height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    border: 1px dashed rgba(16, 36, 30, 0.2);
    border-radius: 16px;
    color: #5B6B65;
    font-size: 14px;
    background: rgba(255, 255, 255, 0.4);
  }

  .hq-food-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .hq-food-item {
    box-sizing: border-box;
    width: 100%;
    padding: 20px;
    border: 1px solid rgba(255, 255, 255, 0.9);
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.65);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    box-shadow: 0 4px 16px rgba(16, 36, 30, 0.04);
    transition: all 0.2s ease;
  }

  .hq-food-item:hover {
    border-color: rgba(31, 158, 118, 0.4);
    transform: translateY(-1px);
  }

  .hq-food-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
  }

  .hq-food-name {
    margin: 0;
    color: #10241E;
    font-size: 16px;
    font-weight: 700;
  }

  .hq-food-date {
    margin-top: 4px;
    color: #5B6B65;
    font-size: 12px;
  }

  .hq-food-calories {
    flex-shrink: 0;
    color: #FF8F6B;
    font-family: var(--font-mono);
    font-size: 16px;
    font-weight: 700;
    background: rgba(255, 143, 107, 0.12);
    padding: 4px 10px;
    border-radius: 999px;
  }

  .hq-nutrition-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-top: 14px;
  }

  .hq-nutrition-item {
    padding: 10px 12px;
    border-radius: 10px;
    background: rgba(16, 36, 30, 0.04);
  }

  .hq-nutrition-value {
    display: block;
    color: #10241E;
    font-family: var(--font-mono);
    font-size: 14px;
    font-weight: 700;
  }

  .hq-nutrition-label {
    display: block;
    margin-top: 2px;
    color: #5B6B65;
    font-size: 11px;
  }

  .hq-section-divider {
    height: 1px;
    margin: 32px 0;
    background: rgba(16, 36, 30, 0.08);
  }

  .hq-manual-heading {
    margin: 0 0 20px;
    color: #10241E;
    font-family: var(--font-display);
    font-size: 20px;
    font-weight: 700;
  }

  @media (max-width: 700px) {
    .hq-log-page {
      padding: 28px 16px 60px;
    }

    .hq-log-title {
      font-size: 30px;
    }

    .hq-food-form {
      padding: 20px;
    }

    .hq-nutrition-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 430px) {
    .hq-nutrition-grid {
      grid-template-columns: 1fr;
    }

    .hq-food-top {
      flex-direction: column;
      gap: 6px;
    }

    .hq-nutrition-row {
      grid-template-columns: 1fr;
    }
  }
`;

/*
  Returns today's date using the user's local computer date.

  This is better than:
    new Date().toISOString().split("T")[0]

  because ISO strings use UTC and can sometimes produce the
  previous/next calendar date depending on timezone.
*/


function getNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.max(number, 0);
}

export default function Log() {
  const { user, loading: authLoading } = useAuth();

  /*
    Manual food form
  */
  const [foodName, setFoodName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");

  /*
    Recent foods
  */
  const [foods, setFoods] = useState([]);

  /*
    Loading states
  */
  const [loading, setLoading] = useState(false);
  const [loadingFoods, setLoadingFoods] = useState(true);

  /*
    Messages
  */
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /*
    Load food records whenever the authenticated user changes.
  */
  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (user) {
      loadFoods();
    } else {
      setFoods([]);
      setLoadingFoods(false);
    }
  }, [user, authLoading]);

  /*
    Load all food records belonging to the current user.
  */
  async function loadFoods() {
    if (!user) {
      setFoods([]);
      setLoadingFoods(false);
      return;
    }

    setLoadingFoods(true);

    try {
      const { data, error: fetchError } = await supabase
        .from("food_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        });

      if (fetchError) {
        console.error(
          "Food loading error:",
          fetchError
        );

        setError(
          `Error loading foods: ${fetchError.message}`
        );

        setFoods([]);
        return;
      }

      setFoods(data || []);
    } catch (err) {
      console.error(
        "Unexpected food loading error:",
        err
      );

      setError("Unable to load food records.");
      setFoods([]);
    } finally {
      setLoadingFoods(false);
    }
  }

  /*
    Save AI-generated food results.

    UploadPhoto should call:

      onFoodAnalyzed(items)

    where items looks like:

      [
        {
          name: "Chicken rice",
          calories: 520,
          protein_g: 32,
          carbs_g: 58,
          fat_g: 16
        }
      ]
  */
  async function saveFoods(items, isAI = true) {
    if (!user) {
      setError("You must be logged in.");
      return false;
    }

    if (!Array.isArray(items) || items.length === 0) {
      setError("No food data was returned.");
      return false;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const mealGroupId = crypto.randomUUID();

      const rows = items.map((item) => ({
        user_id: user.id,

        food_name:
          String(item?.name || "Unknown food").trim(),

        calories: getNumber(item?.calories),

        protein: getNumber(item?.protein_g),

        carbs: getNumber(item?.carbs_g),

        fat: getNumber(item?.fat_g),

        log_date: getLocalDateStr(),

        is_ai_generated: isAI,

        meal_group_id: mealGroupId,
      }));

      /*
        Make sure we don't insert an empty/invalid food name.
      */
      const invalidName = rows.some(
        (row) => !row.food_name
      );

      if (invalidName) {
        setError("One of the food items has no name.");
        return false;
      }

      const { error: insertError } = await supabase
        .from("food_logs")
        .insert(rows);

      if (insertError) {
        console.error(
          "Food save error:",
          insertError
        );

        setError(
          `Error saving food: ${insertError.message}`
        );

        return false;
      }

      setSuccess(
        `${rows.length} ${
          rows.length === 1 ? "food item" : "food items"
        } saved successfully!`
      );

      /*
        Reload recent foods so the new AI entry appears
        immediately.
      */
      await loadFoods();

      /*
        Remove success message after a few seconds.
      */
      setTimeout(() => {
        setSuccess("");
      }, 3500);

      return true;
    } catch (err) {
      console.error(
        "Unexpected AI food save error:",
        err
      );

      setError(
        "Something went wrong while saving the food."
      );
      return false;
    } finally {
      setLoading(false);
    }
  }

  /*
    Called by UploadPhoto after AI analysis.
  */
  async function handleAIResults(items) {
    return await saveFoods(items, true);
  }

  /*
    Manual food submission.
  */
  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (authLoading) {
      setError(
        "Please wait while your session is being verified."
      );
      return;
    }

    if (!user) {
      setError(
        "You must be logged in to save food."
      );
      return;
    }

    /*
      Food name validation
    */
    const cleanFoodName = foodName.trim();

    if (!cleanFoodName) {
      setError("Please enter a food name.");
      return;
    }

    /*
      Calories validation
    */
    const caloriesValue = Number(calories);

    if (
      calories === "" ||
      !Number.isFinite(caloriesValue) ||
      caloriesValue < 0
    ) {
      setError(
        "Please enter a valid calorie amount."
      );
      return;
    }

    /*
      Macro values.
      Blank values are allowed and treated as zero.
    */
    const proteinValue = getNumber(protein);
    const carbsValue = getNumber(carbs);
    const fatValue = getNumber(fat);

    setLoading(true);

    try {
      const mealGroupId = crypto.randomUUID();

      const foodData = {
        user_id: user.id,

        food_name: cleanFoodName,

        calories: caloriesValue,

        protein: proteinValue,

        carbs: carbsValue,

        fat: fatValue,

        log_date: getLocalDateStr(),

        is_ai_generated: false,

        meal_group_id: mealGroupId,
      };

      console.log(
        "Saving manual food:",
        foodData
      );

      const { error: insertError } = await supabase
        .from("food_logs")
        .insert([foodData]);

      if (insertError) {
        console.error(
          "Supabase insert error:",
          insertError
        );

        setError(
          `Error saving food: ${insertError.message}`
        );

        return;
      }

      /*
        Clear the form after successful insert.
      */
      setFoodName("");
      setCalories("");
      setProtein("");
      setCarbs("");
      setFat("");

      setSuccess(
        "Food saved successfully!"
      );

      /*
        Reload recent foods.
      */
      await loadFoods();

      /*
        Remove success message automatically.
      */
      setTimeout(() => {
        setSuccess("");
      }, 3500);
    } catch (err) {
      console.error(
        "Unexpected manual food error:",
        err
      );

      setError(
        "Something went wrong while saving the food."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{styles}</style>

      <main className="hq-log-page">

        <div className="hq-log-container">

          {/* =========================
              PAGE HEADER
          ========================== */}

          <header className="hq-log-header">

            <div className="hq-log-eyebrow">
              HONESTBITE AI
            </div>

            <h1 className="hq-log-title">
              Food Log
            </h1>

            <p className="hq-log-subtitle">
              Track what you eat and keep your
              nutrition organized.
            </p>

          </header>

          {/* =========================
              AI FOOD SCANNER
          ========================== */}

          <UploadPhoto
            onFoodAnalyzed={handleAIResults}
          />

          <div className="hq-section-divider" />

          {/* =========================
              MANUAL FOOD LOGGER
          ========================== */}

          <form
            className="hq-food-form"
            onSubmit={handleSubmit}
          >

            <h2 className="hq-manual-heading">
              Add food manually
            </h2>

            {/* Food name */}

            <div className="hq-form-group">

              <label
                className="hq-form-label"
                htmlFor="foodName"
              >
                Food name
              </label>

              <input
                className="hq-form-input"
                id="foodName"
                type="text"
                placeholder="e.g. Chicken breast"
                value={foodName}
                onChange={(e) =>
                  setFoodName(e.target.value)
                }
                disabled={loading}
              />

            </div>

            {/* Nutrition */}

            <div className="hq-nutrition-grid">

              {/* Calories */}

              <div className="hq-form-group">

                <label
                  className="hq-form-label"
                  htmlFor="calories"
                >
                  Calories
                </label>

                <input
                  className="hq-form-input"
                  id="calories"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="500"
                  value={calories}
                  onChange={(e) =>
                    setCalories(e.target.value)
                  }
                  disabled={loading}
                />

              </div>

              {/* Protein */}

              <div className="hq-form-group">

                <label
                  className="hq-form-label"
                  htmlFor="protein"
                >
                  Protein (g)
                </label>

                <input
                  className="hq-form-input"
                  id="protein"
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="40"
                  value={protein}
                  onChange={(e) =>
                    setProtein(e.target.value)
                  }
                  disabled={loading}
                />

              </div>

              {/* Carbs */}

              <div className="hq-form-group">

                <label
                  className="hq-form-label"
                  htmlFor="carbs"
                >
                  Carbs (g)
                </label>

                <input
                  className="hq-form-input"
                  id="carbs"
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="20"
                  value={carbs}
                  onChange={(e) =>
                    setCarbs(e.target.value)
                  }
                  disabled={loading}
                />

              </div>

              {/* Fat */}

              <div className="hq-form-group">

                <label
                  className="hq-form-label"
                  htmlFor="fat"
                >
                  Fat (g)
                </label>

                <input
                  className="hq-form-input"
                  id="fat"
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="15"
                  value={fat}
                  onChange={(e) =>
                    setFat(e.target.value)
                  }
                  disabled={loading}
                />

              </div>

            </div>

            {/* Save button */}

            <button
              className="hq-save-button"
              type="submit"
              disabled={
                loading ||
                authLoading ||
                !user
              }
            >
              {loading
                ? "Saving..."
                : "Save Food"}
            </button>

            {/* Success */}

            {success && (
              <div className="hq-message hq-success-message">
                {success}
              </div>
            )}

            {/* Error */}

            {error && (
              <div className="hq-message hq-error-message">
                {error}
              </div>
            )}

          </form>

          {/* =========================
              RECENT FOODS
          ========================== */}

          <section className="hq-recent-section">

            <div className="hq-recent-header">

              <h2 className="hq-recent-title">
                Recent Foods
              </h2>

              <span className="hq-entry-count">
                {foods.length}{" "}
                {foods.length === 1
                  ? "entry"
                  : "entries"}
              </span>

            </div>

            {loadingFoods ? (

              <div className="hq-empty-foods">
                Loading foods...
              </div>

            ) : foods.length === 0 ? (

              <div className="hq-empty-foods">
                No foods logged yet.
              </div>

            ) : (
              <div className="hq-food-list" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {groupFoodsByMeal(foods).map((mealItems, idx) => (
                  <MealLogCard
                    key={mealItems[0].meal_group_id || mealItems[0].id || idx}
                    items={mealItems}
                  />
                ))}
              </div>
            )}

          </section>

        </div>

      </main>
    </>
  );
}