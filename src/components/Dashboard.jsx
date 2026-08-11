import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import {
  analyzeDailyTargets,
  analyzeEndOfDayGuidance,
} from "../lib/gemini";

const styles = `
  .hq-dashboard {
    min-height: calc(100vh - 64px);
    box-sizing: border-box;
    padding: 42px 24px 80px;
    color: #10241E;
    font-family: var(--font-body);
  }

  .hq-dashboard-container {
    width: 100%;
    max-width: 1000px;
    margin: 0 auto;
  }

  .hq-dashboard-header {
    margin-bottom: 28px;
  }

  .hq-dashboard-eyebrow {
    margin-bottom: 8px;
    color: #1F9E76;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
  }

  .hq-dashboard-title {
    margin: 0;
    color: #10241E;
    font-family: var(--font-display);
    font-size: 36px;
    line-height: 1.1;
    font-weight: 700;
    letter-spacing: -0.5px;
  }

  .hq-dashboard-subtitle {
    margin: 10px 0 0;
    color: #5B6B65;
    font-size: 15px;
  }

  .hq-stats-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px;
    margin-bottom: 30px;
  }

  .hq-stat-card {
    box-sizing: border-box;
    min-height: 140px;
    padding: 20px;
    border: 1px solid rgba(255, 255, 255, 0.9);
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.65);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    box-shadow: 0 10px 28px rgba(16, 36, 30, 0.05);
  }

  .hq-stat-label {
    color: #5B6B65;
    font-size: 13px;
    font-weight: 600;
  }

  .hq-stat-value {
    margin-top: 14px;
    color: #10241E;
    font-family: var(--font-mono);
    font-size: 30px;
    font-weight: 700;
    letter-spacing: -0.5px;
  }

  .hq-stat-unit {
    margin-left: 5px;
    color: #1F9E76;
    font-size: 13px;
    font-weight: 600;
  }

  .hq-stat-description {
    margin-top: 6px;
    color: #5B6B65;
    font-size: 12px;
  }

  .hq-targets-section {
    margin-bottom: 30px;
  }

  .hq-targets-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }

  .hq-targets-title {
    margin: 0;
    color: #10241E;
    font-family: var(--font-display);
    font-size: 24px;
    font-weight: 700;
  }

  .hq-targets-subtitle {
    color: #5B6B65;
    font-size: 13px;
  }

  .hq-targets-header-right {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .hq-targets-card {
    box-sizing: border-box;
    width: 100%;
    padding: 24px;
    border: 1px solid rgba(255, 255, 255, 0.9);
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.65);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    box-shadow: 0 12px 32px rgba(16, 36, 30, 0.06);
  }

  .hq-target-row {
    margin-bottom: 20px;
  }

  .hq-target-row:last-child {
    margin-bottom: 0;
  }

  .hq-target-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 8px;
  }

  .hq-target-name {
    color: #10241E;
    font-size: 14px;
    font-weight: 600;
  }

  .hq-target-values {
    color: #5B6B65;
    font-family: var(--font-mono);
    font-size: 13px;
  }

  .hq-target-current {
    color: #10241E;
    font-weight: 700;
  }

  .hq-target-bar {
    width: 100%;
    height: 10px;
    overflow: hidden;
    border-radius: 999px;
    background: rgba(16, 36, 30, 0.08);
  }

  .hq-target-progress {
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(
      90deg,
      #1F9E76,
      #34D399
    );
    transition: width 0.4s ease;
  }

  .hq-target-progress.complete {
    background: linear-gradient(
      90deg,
      #1F9E76,
      #059669
    );
  }

  .hq-section {
    margin-top: 32px;
  }

  .hq-section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }

  .hq-section-title {
    margin: 0;
    color: #10241E;
    font-family: var(--font-display);
    font-size: 24px;
    font-weight: 700;
  }

  .hq-section-count {
    color: #5B6B65;
    font-size: 13px;
  }

  .hq-food-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .hq-food-card {
    box-sizing: border-box;
    width: 100%;
    padding: 20px;
    border: 1px solid rgba(255, 255, 255, 0.9);
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.65);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    box-shadow: 0 4px 16px rgba(16, 36, 30, 0.04);
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
    color: #FF8F6B;
    font-family: var(--font-mono);
    font-size: 15px;
    font-weight: 700;
    background: rgba(255, 143, 107, 0.12);
    padding: 4px 10px;
    border-radius: 999px;
    white-space: nowrap;
  }

  .hq-food-nutrition {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-top: 14px;
  }

  .hq-food-nutrition-item {
    padding: 10px 12px;
    border-radius: 10px;
    background: rgba(16, 36, 30, 0.04);
  }

  .hq-food-nutrition-value {
    display: block;
    color: #10241E;
    font-family: var(--font-mono);
    font-size: 14px;
    font-weight: 700;
  }

  .hq-food-nutrition-label {
    display: block;
    margin-top: 2px;
    color: #5B6B65;
    font-size: 11px;
  }

  .hq-empty {
    box-sizing: border-box;
    width: 100%;
    min-height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    border: 1px dashed rgba(16, 36, 30, 0.2);
    border-radius: 16px;
    color: #5B6B65;
    font-size: 14px;
    background: rgba(255, 255, 255, 0.4);
    text-align: center;
  }

  .hq-error {
    box-sizing: border-box;
    padding: 14px;
    margin-bottom: 20px;
    border: 1px solid rgba(239, 68, 68, 0.25);
    border-radius: 10px;
    background: rgba(239, 68, 68, 0.1);
    color: #dc2626;
    font-size: 13px;
  }

  .hq-refresh-button,
  .hq-recalculate-button,
  .hq-guidance-button {
    border: 1px solid rgba(31, 158, 118, 0.3);
    border-radius: 999px;
    padding: 8px 16px;
    background: rgba(31, 158, 118, 0.1);
    color: #1F9E76;
    font-family: inherit;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .hq-refresh-button:hover,
  .hq-recalculate-button:hover,
  .hq-guidance-button:hover {
    background: rgba(31, 158, 118, 0.2);
  }

  .hq-refresh-button:disabled,
  .hq-recalculate-button:disabled,
  .hq-guidance-button:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .hq-guidance-section {
    margin-bottom: 30px;
  }

  .hq-guidance-card {
    box-sizing: border-box;
    width: 100%;
    padding: 24px;
    border: 1px solid rgba(255, 255, 255, 0.9);
    border-radius: 20px;
    background: linear-gradient(135deg, rgba(217, 242, 230, 0.6) 0%, rgba(255, 255, 255, 0.7) 100%);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    box-shadow: 0 12px 32px rgba(16, 36, 30, 0.06);
  }

  .hq-guidance-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    margin-bottom: 14px;
  }

  .hq-guidance-title {
    margin: 0;
    color: #10241E;
    font-family: var(--font-display);
    font-size: 20px;
    font-weight: 700;
  }

  .hq-guidance-subtitle {
    margin-top: 4px;
    color: #5B6B65;
    font-size: 12px;
  }

  .hq-guidance-button {
    flex-shrink: 0;
    color: #ffffff;
    border: none;
    background: #1F9E76;
    box-shadow: 0 4px 12px rgba(31, 158, 118, 0.25);
  }

  .hq-guidance-button:hover {
    background: #178361;
  }

  .hq-guidance-result {
    padding: 16px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.75);
    border: 1px solid rgba(16, 36, 30, 0.08);
    color: #10241E;
    font-size: 14px;
    line-height: 1.6;
  }

  .hq-guidance-label {
    display: block;
    margin-bottom: 6px;
    color: #1F9E76;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  .hq-guidance-error {
    padding: 12px 14px;
    border-radius: 10px;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.25);
    color: #dc2626;
    font-size: 13px;
  }

  .hq-profile-warning {
    box-sizing: border-box;
    padding: 20px;
    border: 1px dashed rgba(16, 36, 30, 0.2);
    border-radius: 16px;
    color: #5B6B65;
    font-size: 14px;
    line-height: 1.6;
    background: rgba(255, 255, 255, 0.4);
    text-align: center;
  }

  .hq-profile-warning strong {
    color: #10241E;
  }

  .hq-ai-status {
    margin-top: 8px;
    color: #5B6B65;
    font-size: 12px;
  }

  .hq-success {
    box-sizing: border-box;
    padding: 10px 14px;
    margin-bottom: 14px;
    border: 1px solid rgba(31, 158, 118, 0.25);
    border-radius: 10px;
    background: rgba(31, 158, 118, 0.1);
    color: #1F9E76;
    font-size: 13px;
  }

  @media (max-width: 800px) {
    .hq-stats-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 500px) {
    .hq-dashboard {
      padding: 28px 14px 60px;
    }

    .hq-dashboard-title {
      font-size: 30px;
    }

    .hq-stats-grid {
      grid-template-columns: 1fr;
    }

    .hq-targets-card,
    .hq-guidance-card {
      padding: 16px;
    }

    .hq-target-info {
      align-items: flex-start;
      flex-direction: column;
      gap: 4px;
    }

    .hq-targets-header,
    .hq-guidance-top {
      align-items: flex-start;
      flex-direction: column;
    }

    .hq-targets-header-right {
      width: 100%;
      justify-content: space-between;
    }

    .hq-guidance-button {
      width: 100%;
    }

    .hq-food-top {
      flex-direction: column;
      gap: 6px;
    }

    .hq-food-nutrition {
      grid-template-columns: 1fr;
    }
  }
`;

export default function Dashboard() {
  const { user } = useAuth();

  const [foods, setFoods] = useState([]);
  const [targets, setTargets] = useState(null);

  const [loading, setLoading] = useState(true);
  const [targetsLoading, setTargetsLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);

  const [error, setError] = useState("");
  const [targetsError, setTargetsError] = useState("");

  const [targetSuccess, setTargetSuccess] = useState("");

  const [guidance, setGuidance] = useState("");
  const [guidanceLoading, setGuidanceLoading] = useState(false);
  const [guidanceError, setGuidanceError] = useState("");

  useEffect(() => {
    if (!user) {
      setFoods([]);
      setTargets(null);
      setLoading(false);
      setTargetsLoading(false);
      return;
    }

    loadDashboard();
  }, [user]);

  async function loadDashboard() {
    setLoading(true);
    setTargetsLoading(true);

    setError("");
    setTargetsError("");
    setTargetSuccess("");

    await Promise.all([
      loadTodayFoods(),
      loadSavedTargets(),
    ]);

    setLoading(false);
    setTargetsLoading(false);
  }

  /*
  =========================================================
  LOAD TODAY'S FOOD
  =========================================================
  */

  async function loadTodayFoods() {
    if (!user) return;

    try {
      const today = new Date()
        .toISOString()
        .slice(0, 10);

      const { data, error } = await supabase
        .from("food_logs")
        .select("*")
        .eq("user_id", user.id)
        .eq("log_date", today)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error(
          "Dashboard food loading error:",
          error
        );

        setError(error.message);
        setFoods([]);
        return;
      }

      setFoods(data || []);
    } catch (err) {
      console.error(
        "Unexpected food loading error:",
        err
      );

      setError(
        "Unable to load today's food."
      );

      setFoods([]);
    }
  }

  /*
  =========================================================
  LOAD SAVED DAILY TARGETS
  =========================================================

  Daily targets are intentionally loaded from Supabase.

  Gemini is NOT called automatically here.

  Recalculation happens only when the user clicks
  "Recalculate".
  =========================================================
  */

  async function loadSavedTargets() {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("daily_targets")
        .select("*")
        .eq("user_id", user.id)
        .eq("active", true)
        .order("generated_at", {
          ascending: false,
        })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error(
          "Daily target loading error:",
          error
        );

        setTargetsError(error.message);
        setTargets(null);
        return;
      }

      if (!data) {
        setTargets(null);

        setTargetsError(
          "No daily targets found. Complete your profile and recalculate your targets."
        );

        return;
      }

      setTargets({
        calories: Number(data.calories) || 0,
        protein: Number(data.protein_g) || 0,
        carbs: Number(data.carbs_g) || 0,
        fat: Number(data.fat_g) || 0,
        fiber: Number(data.fiber_g) || 0,
        iron: Number(data.iron_mg) || 0,
        calcium: Number(data.calcium_mg) || 0,
      });
    } catch (err) {
      console.error(
        "Unexpected target loading error:",
        err
      );

      setTargetsError(
        "Unable to load your daily targets."
      );

      setTargets(null);
    }
  }

  /*
  =========================================================
  RECALCULATE DAILY TARGETS
  =========================================================
  */

  async function recalculateTargets() {
    if (!user) return;

    setRecalculating(true);
    setTargetsError("");
    setTargetSuccess("");

    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select(
          "age, weight_kg, height_cm, activity_level, goal, health_conditions"
        )
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        throw new Error(error.message);
      }

      if (!profile) {
        throw new Error(
          "Complete your profile first so we can calculate your daily targets."
        );
      }

      const result = await analyzeDailyTargets({
        age: profile.age,
        weight_kg: profile.weight_kg,
        height_cm: profile.height_cm,
        activity_level: profile.activity_level,
        goal: profile.goal,
        health_conditions:
          profile.health_conditions ||
          "none reported",
      });

      if (
        !result ||
        typeof result.calories !== "number" ||
        typeof result.protein_g !== "number" ||
        typeof result.carbs_g !== "number" ||
        typeof result.fat_g !== "number" ||
        typeof result.fiber_g !== "number" ||
        typeof result.iron_mg !== "number" ||
        typeof result.calcium_mg !== "number"
      ) {
        throw new Error(
          "Gemini returned invalid nutrition targets."
        );
      }

      /*
      Deactivate existing target.
      */

      const { error: deactivateError } =
        await supabase
          .from("daily_targets")
          .update({
            active: false,
          })
          .eq("user_id", user.id)
          .eq("active", true);

      if (deactivateError) {
        throw new Error(
          deactivateError.message
        );
      }

      /*
      Save new active target.
      */

      const { error: insertError } =
        await supabase
          .from("daily_targets")
          .insert({
            user_id: user.id,
            calories: result.calories,
            protein_g: result.protein_g,
            carbs_g: result.carbs_g,
            fat_g: result.fat_g,
            fiber_g: result.fiber_g,
            iron_mg: result.iron_mg,
            calcium_mg: result.calcium_mg,
            active: true,
          });

      if (insertError) {
        throw new Error(insertError.message);
      }

      setTargets({
        calories: result.calories,
        protein: result.protein_g,
        carbs: result.carbs_g,
        fat: result.fat_g,
        fiber: result.fiber_g,
        iron: result.iron_mg,
        calcium: result.calcium_mg,
      });

      setTargetSuccess(
        "Your daily nutrition targets have been recalculated and saved."
      );
    } catch (err) {
      console.error(
        "Target recalculation error:",
        err
      );

      setTargetsError(
        err?.message ||
          "Unable to calculate daily targets."
      );
    } finally {
      setRecalculating(false);
    }
  }

  /*
  =========================================================
  GET FIELD VALUE
  =========================================================

  Supports the currently working dashboard field names
  while also supporting the handoff's *_g / *_mg names.
  =========================================================
  */

  function getFoodValue(food, primary, fallback) {
    const primaryValue = Number(food?.[primary]);

    if (Number.isFinite(primaryValue)) {
      return primaryValue;
    }

    const fallbackValue = Number(
      food?.[fallback]
    );

    if (Number.isFinite(fallbackValue)) {
      return fallbackValue;
    }

    return 0;
  }

  /*
  =========================================================
  FULL NUTRITION TOTALS
  =========================================================

  Includes the seven nutrients used by Gemini guidance.
  =========================================================
  */

  const totals = foods.reduce(
    (acc, food) => {
      acc.calories += getFoodValue(
        food,
        "calories",
        "calories"
      );

      acc.protein_g += getFoodValue(
        food,
        "protein",
        "protein_g"
      );

      acc.carbs_g += getFoodValue(
        food,
        "carbs",
        "carbs_g"
      );

      acc.fat_g += getFoodValue(
        food,
        "fat",
        "fat_g"
      );

      acc.fiber_g += getFoodValue(
        food,
        "fiber",
        "fiber_g"
      );

      acc.iron_mg += getFoodValue(
        food,
        "iron",
        "iron_mg"
      );

      acc.calcium_mg += getFoodValue(
        food,
        "calcium",
        "calcium_mg"
      );

      return acc;
    },
    {
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      fiber_g: 0,
      iron_mg: 0,
      calcium_mg: 0,
    }
  );

  /*
  =========================================================
  GENERATE AI DAILY GUIDANCE
  =========================================================
  */

  async function getDailyGuidance() {
    if (!targets) {
      setGuidanceError(
        "Daily targets are unavailable. Recalculate your targets first."
      );

      return;
    }

    if (foods.length === 0) {
      setGuidanceError(
        "Log some food first so Gemini can review today's nutrition."
      );

      return;
    }

    setGuidanceLoading(true);
    setGuidanceError("");
    setGuidance("");

    try {
      const result =
        await analyzeEndOfDayGuidance(
          {
            calories: Number(
              totals.calories.toFixed(1)
            ),
            protein_g: Number(
              totals.protein_g.toFixed(1)
            ),
            carbs_g: Number(
              totals.carbs_g.toFixed(1)
            ),
            fat_g: Number(
              totals.fat_g.toFixed(1)
            ),
            fiber_g: Number(
              totals.fiber_g.toFixed(1)
            ),
            iron_mg: Number(
              totals.iron_mg.toFixed(1)
            ),
            calcium_mg: Number(
              totals.calcium_mg.toFixed(1)
            ),
          },
          {
            calories: Number(
              targets.calories.toFixed(1)
            ),
            protein_g: Number(
              targets.protein.toFixed(1)
            ),
            carbs_g: Number(
              targets.carbs.toFixed(1)
            ),
            fat_g: Number(
              targets.fat.toFixed(1)
            ),
            fiber_g: Number(
              targets.fiber.toFixed(1)
            ),
            iron_mg: Number(
              targets.iron.toFixed(1)
            ),
            calcium_mg: Number(
              targets.calcium.toFixed(1)
            ),
          }
        );

      if (
        !result ||
        typeof result.guidance !== "string" ||
        !result.guidance.trim()
      ) {
        throw new Error(
          "Gemini returned an empty guidance response."
        );
      }

      setGuidance(result.guidance.trim());
    } catch (err) {
      console.error(
        "Daily guidance error:",
        err
      );

      setGuidanceError(
        err?.message ||
          "Unable to generate today's guidance."
      );
    } finally {
      setGuidanceLoading(false);
    }
  }

  /*
  =========================================================
  PROGRESS
  =========================================================
  */

  function getProgress(current, target) {
    if (!target || target <= 0) {
      return 0;
    }

    return Math.min(
      (current / target) * 100,
      100
    );
  }

  /*
  =========================================================
  TARGET ROWS
  =========================================================
  */

  const targetRows = targets
    ? [
        {
          label: "Calories",
          current: Math.round(
            totals.calories
          ),
          target: Math.round(
            targets.calories
          ),
          unit: "kcal",
        },
        {
          label: "Protein",
          current: Number(
            totals.protein_g.toFixed(1)
          ),
          target: Number(
            targets.protein.toFixed(1)
          ),
          unit: "g",
        },
        {
          label: "Carbs",
          current: Number(
            totals.carbs_g.toFixed(1)
          ),
          target: Number(
            targets.carbs.toFixed(1)
          ),
          unit: "g",
        },
        {
          label: "Fat",
          current: Number(
            totals.fat_g.toFixed(1)
          ),
          target: Number(
            targets.fat.toFixed(1)
          ),
          unit: "g",
        },
      ]
    : [];

  /*
  =========================================================
  RENDER
  =========================================================
  */

  return (
    <>
      <style>{styles}</style>

      <main className="hq-dashboard">
        <div className="hq-dashboard-container">

          <header className="hq-dashboard-header">
            <div className="hq-dashboard-eyebrow">
              HQ DOPAMINE
            </div>

            <h1 className="hq-dashboard-title">
              Dashboard
            </h1>

            <p className="hq-dashboard-subtitle">
              Your personalized nutrition overview
              for today.
            </p>
          </header>

          {error && (
            <div className="hq-error">
              {error}
            </div>
          )}

          {/* =================================================
              TODAY'S TOTALS
          ================================================= */}

          <section className="hq-stats-grid">

            <div className="hq-stat-card">
              <div className="hq-stat-label">
                CALORIES
              </div>

              <div className="hq-stat-value">
                {loading
                  ? "—"
                  : Math.round(
                      totals.calories
                    )}

                <span className="hq-stat-unit">
                  kcal
                </span>
              </div>

              <div className="hq-stat-description">
                Today's intake
              </div>
            </div>

            <div className="hq-stat-card">
              <div className="hq-stat-label">
                PROTEIN
              </div>

              <div className="hq-stat-value">
                {loading
                  ? "—"
                  : totals.protein_g.toFixed(1)}

                <span className="hq-stat-unit">
                  g
                </span>
              </div>

              <div className="hq-stat-description">
                Total protein
              </div>
            </div>

            <div className="hq-stat-card">
              <div className="hq-stat-label">
                CARBS
              </div>

              <div className="hq-stat-value">
                {loading
                  ? "—"
                  : totals.carbs_g.toFixed(1)}

                <span className="hq-stat-unit">
                  g
                </span>
              </div>

              <div className="hq-stat-description">
                Total carbohydrates
              </div>
            </div>

            <div className="hq-stat-card">
              <div className="hq-stat-label">
                FAT
              </div>

              <div className="hq-stat-value">
                {loading
                  ? "—"
                  : totals.fat_g.toFixed(1)}

                <span className="hq-stat-unit">
                  g
                </span>
              </div>

              <div className="hq-stat-description">
                Total fat
              </div>
            </div>

          </section>

          {/* =================================================
              DAILY TARGETS
          ================================================= */}

          <section className="hq-targets-section">

            <div className="hq-targets-header">

              <h2 className="hq-targets-title">
                Daily Targets
              </h2>

              <div className="hq-targets-header-right">

                <span className="hq-targets-subtitle">
                  AI personalized
                </span>

                <button
                  className="hq-recalculate-button"
                  onClick={recalculateTargets}
                  disabled={recalculating}
                >
                  {recalculating
                    ? "Recalculating..."
                    : "Recalculate"}
                </button>

              </div>

            </div>

            <div className="hq-targets-card">

              {targetSuccess && (
                <div className="hq-success">
                  {targetSuccess}
                </div>
              )}

              {targetsLoading ? (
                <div className="hq-empty">
                  <div>
                    Loading your personalized
                    nutrition targets...
                    <div className="hq-ai-status">
                      Using your saved AI targets.
                    </div>
                  </div>
                </div>
              ) : targetsError ? (
                <div className="hq-profile-warning">
                  <strong>
                    Daily targets unavailable
                  </strong>

                  <br />

                  {targetsError}
                </div>
              ) : (
                targetRows.map((item) => {

                  const progress =
                    getProgress(
                      item.current,
                      item.target
                    );

                  return (
                    <div
                      className="hq-target-row"
                      key={item.label}
                    >

                      <div className="hq-target-info">

                        <span className="hq-target-name">
                          {item.label}
                        </span>

                        <span className="hq-target-values">

                          <span className="hq-target-current">
                            {item.current}
                          </span>

                          {" / "}

                          {item.target}{" "}
                          {item.unit}

                        </span>

                      </div>

                      <div className="hq-target-bar">

                        <div
                          className={`hq-target-progress ${
                            progress >= 100
                              ? "complete"
                              : ""
                          }`}
                          style={{
                            width: `${progress}%`,
                          }}
                        />

                      </div>

                    </div>
                  );
                })
              )}

            </div>

          </section>

          {/* =================================================
              AI DAILY GUIDANCE
          ================================================= */}

          <section className="hq-guidance-section">

            <div className="hq-guidance-card">

              <div className="hq-guidance-top">

                <div>
                  <h2 className="hq-guidance-title">
                    AI Daily Guidance
                  </h2>

                  <div className="hq-guidance-subtitle">
                    Gemini compares today's intake
                    with your nutrition targets.
                  </div>
                </div>

                <button
                  className="hq-guidance-button"
                  onClick={getDailyGuidance}
                  disabled={
                    guidanceLoading ||
                    !targets ||
                    foods.length === 0
                  }
                >
                  {guidanceLoading
                    ? "Analyzing..."
                    : "Get Today's Guidance"}
                </button>

              </div>

              {guidanceError && (
                <div className="hq-guidance-error">
                  {guidanceError}
                </div>
              )}

              {guidance && (
                <div className="hq-guidance-result">
                  <span className="hq-guidance-label">
                    Today's insight
                  </span>

                  {guidance}
                </div>
              )}

              {!guidance &&
                !guidanceError &&
                !guidanceLoading && (
                  <div className="hq-empty">
                    Click "Get Today's Guidance" to
                    have Gemini review today's
                    nutrition.
                  </div>
                )}

              {guidanceLoading && (
                <div className="hq-empty">
                  Gemini is reviewing today's
                  nutrition against your targets...
                </div>
              )}

            </div>

          </section>

          {/* =================================================
              TODAY'S FOOD
          ================================================= */}

          <section className="hq-section">

            <div className="hq-section-header">

              <h2 className="hq-section-title">
                Today's Food
              </h2>

              <div>

                <span className="hq-section-count">
                  {foods.length}{" "}
                  {foods.length === 1
                    ? "entry"
                    : "entries"}
                </span>

                <button
                  className="hq-refresh-button"
                  onClick={loadDashboard}
                  disabled={loading}
                  style={{
                    marginLeft: "10px",
                  }}
                >
                  {loading
                    ? "Loading..."
                    : "Refresh"}
                </button>

              </div>

            </div>

            {loading ? (
              <div className="hq-empty">
                Loading today's food...
              </div>
            ) : foods.length === 0 ? (
              <div className="hq-empty">
                No food logged today yet.
              </div>
            ) : (
              <div className="hq-food-list">

                {foods.map((food) => (

                  <article
                    className="hq-food-card"
                    key={food.id}
                  >

                    <div className="hq-food-top">

                      <div>

                        <h3 className="hq-food-name">
                          {food.food_name}
                        </h3>

                        {(food.created_at ||
                          food.logged_at) && (
                          <div className="hq-food-date">
                            {new Date(
                              food.created_at ||
                                food.logged_at
                            ).toLocaleString()}
                          </div>
                        )}

                      </div>

                      <div className="hq-food-calories">
                        {getFoodValue(
                          food,
                          "calories",
                          "calories"
                        )}{" "}
                        kcal
                      </div>

                    </div>

                    <div className="hq-food-nutrition">

                      <div className="hq-food-nutrition-item">

                        <span className="hq-food-nutrition-value">
                          {getFoodValue(
                            food,
                            "protein",
                            "protein_g"
                          ).toFixed(1)}
                          g
                        </span>

                        <span className="hq-food-nutrition-label">
                          Protein
                        </span>

                      </div>

                      <div className="hq-food-nutrition-item">

                        <span className="hq-food-nutrition-value">
                          {getFoodValue(
                            food,
                            "carbs",
                            "carbs_g"
                          ).toFixed(1)}
                          g
                        </span>

                        <span className="hq-food-nutrition-label">
                          Carbs
                        </span>

                      </div>

                      <div className="hq-food-nutrition-item">

                        <span className="hq-food-nutrition-value">
                          {getFoodValue(
                            food,
                            "fat",
                            "fat_g"
                          ).toFixed(1)}
                          g
                        </span>

                        <span className="hq-food-nutrition-label">
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