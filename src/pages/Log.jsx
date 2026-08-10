import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import UploadPhoto from "../components/UploadPhoto";

const styles = `
  .hq-log-page {
    min-height: calc(100vh - 64px);
    box-sizing: border-box;
    padding: 42px 24px 80px;
    background:
      radial-gradient(
        circle at 0% 0%,
        rgba(102, 31, 255, 0.24),
        transparent 38%
      ),
      radial-gradient(
        circle at 100% 100%,
        rgba(0, 185, 255, 0.10),
        transparent 35%
      ),
      #09090d;
    color: #f5f5f7;
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
    color: #a78bfa;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
  }

  .hq-log-title {
    margin: 0;
    color: #ffffff;
    font-size: 34px;
    line-height: 1.1;
    font-weight: 800;
    letter-spacing: -1px;
  }

  .hq-log-subtitle {
    margin: 10px 0 0;
    color: #8d8da1;
    font-size: 14px;
    line-height: 1.5;
  }

  .hq-food-form {
    box-sizing: border-box;
    width: 100%;
    padding: 24px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 17px;
    background: rgba(18, 18, 24, 0.88);
    box-shadow:
      0 20px 50px rgba(0, 0, 0, 0.25),
      inset 0 1px 0 rgba(255, 255, 255, 0.025);
  }

  .hq-form-group {
    margin-bottom: 18px;
  }

  .hq-form-label {
    display: block;
    margin-bottom: 8px;
    color: #d9d9e2;
    font-size: 12px;
    font-weight: 700;
  }

  .hq-form-input {
    box-sizing: border-box;
    width: 100%;
    height: 42px;
    padding: 0 13px;
    border: 1px solid #292932;
    border-radius: 10px;
    outline: none;
    background: #111116;
    color: #ffffff;
    font-family: inherit;
    font-size: 14px;
  }

  .hq-form-input::placeholder {
    color: #555563;
  }

  .hq-form-input:focus {
    border-color: #8b5cf6;
    background: #121219;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.13);
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
    height: 44px;
    margin-top: 2px;
    border: none;
    border-radius: 10px;
    background: linear-gradient(90deg, #8b5cf6, #9257f5);
    color: #ffffff;
    font-family: inherit;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition:
      transform 0.15s ease,
      filter 0.15s ease;
  }

  .hq-save-button:hover:not(:disabled) {
    filter: brightness(1.08);
    transform: translateY(-1px);
  }

  .hq-save-button:disabled {
    cursor: not-allowed;
    opacity: 0.65;
  }

  .hq-message {
    margin-top: 14px;
    padding: 11px 13px;
    border-radius: 9px;
    font-size: 13px;
    line-height: 1.4;
    text-align: center;
  }

  .hq-success-message {
    border: 1px solid rgba(34, 197, 94, 0.2);
    background: rgba(34, 197, 94, 0.10);
    color: #6ee7a0;
  }

  .hq-error-message {
    border: 1px solid rgba(248, 113, 113, 0.18);
    background: rgba(248, 113, 113, 0.08);
    color: #fca5a5;
  }

  .hq-recent-section {
    margin-top: 32px;
  }

  .hq-recent-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .hq-recent-title {
    margin: 0;
    color: #ffffff;
    font-size: 20px;
    font-weight: 800;
  }

  .hq-entry-count {
    color: #666676;
    font-size: 12px;
  }

  .hq-empty-foods {
    box-sizing: border-box;
    width: 100%;
    min-height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 18px;
    border: 1px dashed #292932;
    border-radius: 14px;
    color: #666676;
    font-size: 13px;
    background: rgba(13, 13, 18, 0.45);
  }

  .hq-food-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .hq-food-item {
    box-sizing: border-box;
    width: 100%;
    padding: 16px 17px;
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 13px;
    background: rgba(16, 16, 22, 0.75);
    transition: border-color 0.15s ease;
  }

  .hq-food-item:hover {
    border-color: rgba(139, 92, 246, 0.28);
  }

  .hq-food-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
  }

  .hq-food-name {
    margin: 0;
    color: #ffffff;
    font-size: 15px;
    font-weight: 700;
  }

  .hq-food-date {
    margin-top: 5px;
    color: #666676;
    font-size: 11px;
  }

  .hq-food-calories {
    flex-shrink: 0;
    color: #a78bfa;
    font-size: 14px;
    font-weight: 800;
  }

  .hq-nutrition-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin-top: 14px;
  }

  .hq-nutrition-item {
    padding: 9px 10px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.025);
  }

  .hq-nutrition-value {
    display: block;
    color: #eeeeF4;
    font-size: 13px;
    font-weight: 700;
  }

  .hq-nutrition-label {
    display: block;
    margin-top: 2px;
    color: #666676;
    font-size: 10px;
  }

  .hq-section-divider {
    height: 1px;
    margin: 28px 0;
    background: rgba(255, 255, 255, 0.06);
  }

  .hq-manual-heading {
    margin: 0 0 20px;
    color: #ffffff;
    font-size: 17px;
    font-weight: 800;
  }

  @media (max-width: 700px) {
    .hq-log-page {
      padding: 28px 16px 60px;
    }

    .hq-log-title {
      font-size: 30px;
    }

    .hq-food-form {
      padding: 18px;
    }

    .hq-nutrition-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 430px) {
    .hq-log-page {
      padding-left: 12px;
      padding-right: 12px;
    }

    .hq-nutrition-grid {
      grid-template-columns: 1fr;
    }

    .hq-food-top {
      flex-direction: column;
      gap: 5px;
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
function getLocalDate() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

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
      return;
    }

    if (!Array.isArray(items) || items.length === 0) {
      setError("No food data was returned.");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const rows = items.map((item) => ({
        user_id: user.id,

        food_name:
          String(item?.name || "Unknown food").trim(),

        calories: getNumber(item?.calories),

        protein: getNumber(item?.protein_g),

        carbs: getNumber(item?.carbs_g),

        fat: getNumber(item?.fat_g),

        log_date: getLocalDate(),

        is_ai_generated: isAI,
      }));

      /*
        Make sure we don't insert an empty/invalid food name.
      */
      const invalidName = rows.some(
        (row) => !row.food_name
      );

      if (invalidName) {
        setError("One of the food items has no name.");
        return;
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

        return;
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
    } catch (err) {
      console.error(
        "Unexpected AI food save error:",
        err
      );

      setError(
        "Something went wrong while saving the food."
      );
    } finally {
      setLoading(false);
    }
  }

  /*
    Called by UploadPhoto after AI analysis.
  */
  async function handleAIResults(items) {
    await saveFoods(items, true);
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
      const foodData = {
        user_id: user.id,

        food_name: cleanFoodName,

        calories: caloriesValue,

        protein: proteinValue,

        carbs: carbsValue,

        fat: fatValue,

        log_date: getLocalDate(),

        is_ai_generated: false,
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
              HQ DOPAMINE
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

              <div className="hq-food-list">

                {foods.map((food) => (

                  <article
                    className="hq-food-item"
                    key={food.id}
                  >

                    <div className="hq-food-top">

                      <div>

                        <h3 className="hq-food-name">
                          {food.food_name}
                        </h3>

                        {food.created_at && (
                          <div className="hq-food-date">
                            {new Date(
                              food.created_at
                            ).toLocaleString()}
                          </div>
                        )}

                      </div>

                      <div className="hq-food-calories">
                        {Number(food.calories || 0).toFixed(0)}{" "}
                        kcal
                      </div>

                    </div>

                    <div className="hq-nutrition-row">

                      <div className="hq-nutrition-item">

                        <span className="hq-nutrition-value">
                          {Number(
                            food.protein || 0
                          ).toFixed(1)}
                          g
                        </span>

                        <span className="hq-nutrition-label">
                          Protein
                        </span>

                      </div>

                      <div className="hq-nutrition-item">

                        <span className="hq-nutrition-value">
                          {Number(
                            food.carbs || 0
                          ).toFixed(1)}
                          g
                        </span>

                        <span className="hq-nutrition-label">
                          Carbs
                        </span>

                      </div>

                      <div className="hq-nutrition-item">

                        <span className="hq-nutrition-value">
                          {Number(
                            food.fat || 0
                          ).toFixed(1)}
                          g
                        </span>

                        <span className="hq-nutrition-label">
                          Fat
                        </span>

                      </div>

                    </div>

                  </article>

                ))}

              </div>

            )}

          </section>

        </div>

      </main>
    </>
  );
}