import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import {
  analyzeDailyTargets,
  analyzeEndOfDayGuidance,
} from "../lib/gemini";
import MealLogCard from "./MealLogCard";

import { getLocalDateStr, groupFoodsByMeal } from "../lib/foodLogUtils";

function formatDateLabel(dateStr) {
  const today = getLocalDateStr(0);
  const yesterday = getLocalDateStr(1);

  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  const monthName = d.toLocaleDateString("en-US", { month: "short" });
  const dayNum = d.getDate();
  const dayOfWeek = d.toLocaleDateString("en-US", { weekday: "short" });

  if (dateStr === today) {
    return `Today (${monthName} ${dayNum})`;
  }
  if (dateStr === yesterday) {
    return `Yesterday (${monthName} ${dayNum})`;
  }
  return `${dayOfWeek}, ${monthName} ${dayNum}`;
}


export default function Dashboard() {
  const { user } = useAuth();

  const [foods, setFoods] = useState([]);
  const [historyFoods, setHistoryFoods] = useState([]);
  const [expandedDates, setExpandedDates] = useState({});
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
      setHistoryFoods([]);
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
      loadRecentFoods(),
      loadSavedTargets(),
    ]);

    setLoading(false);
    setTargetsLoading(false);
  }

  /*
  =========================================================
  LOAD RECENT 7-DAY FOOD LOGS
  =========================================================
  */

  async function loadRecentFoods() {
    if (!user) return;

    try {
      const today = getLocalDateStr(0);
      const sevenDaysAgo = getLocalDateStr(6);

      const { data, error } = await supabase
        .from("food_logs")
        .select("*")
        .eq("user_id", user.id)
        .gte("log_date", sevenDaysAgo)
        .order("log_date", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) {
        console.error(
          "Dashboard food loading error:",
          error
        );

        setError(error.message);
        setFoods([]);
        setHistoryFoods([]);
        return;
      }

      const allItems = data || [];
      setHistoryFoods(allItems);

      // Filter for today's food
      const todaysList = allItems.filter(
        (item) => item.log_date === today
      );
      setFoods(todaysList);
    } catch (err) {
      console.error(
        "Unexpected food loading error:",
        err
      );

      setError(
        "Unable to load food records."
      );

      setFoods([]);
      setHistoryFoods([]);
    }
  }

  const toggleDateExpanded = (dateStr) => {
    setExpandedDates((prev) => ({
      ...prev,
      [dateStr]: !prev[dateStr],
    }));
  };


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
    <main className="min-h-[calc(100vh-64px)] px-4 py-8 sm:px-6 sm:py-12 text-[#10241E]">
      <div className="w-full max-w-5xl mx-auto">

        <header className="mb-7">
          <div className="text-[#1F9E76] text-xs font-bold tracking-widest uppercase mb-2">
            HONESTBITE AI
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#10241E] tracking-tight leading-tight">
            Dashboard
          </h1>

          <p className="mt-2 text-[#5B6B65] text-sm sm:text-base">
            Your personalized nutrition overview
            for today.
          </p>
        </header>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-600 text-xs sm:text-sm">
            {error}
          </div>
        )}

        {/* =================================================
            TODAY'S TOTALS
        ================================================= */}

        <section className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">

          <div className="glass-card p-4 sm:p-5 rounded-2xl min-h-[120px] sm:min-h-[140px] flex flex-col justify-between">
            <div className="text-[#5B6B65] text-xs font-semibold tracking-wide">
              CALORIES
            </div>

            <div className="font-mono text-2xl sm:text-3xl font-bold text-[#10241E] tracking-tight my-1">
              {loading
                ? "—"
                : Math.round(
                    totals.calories
                  )}

              <span className="text-xs font-semibold text-[#1F9E76] ml-1">
                kcal
              </span>
            </div>

            <div className="text-[#5B6B65] text-xs">
              Today's intake
            </div>
          </div>

          <div className="glass-card p-4 sm:p-5 rounded-2xl min-h-[120px] sm:min-h-[140px] flex flex-col justify-between">
            <div className="text-[#5B6B65] text-xs font-semibold tracking-wide">
              PROTEIN
            </div>

            <div className="font-mono text-2xl sm:text-3xl font-bold text-[#10241E] tracking-tight my-1">
              {loading
                ? "—"
                : totals.protein_g.toFixed(1)}

              <span className="text-xs font-semibold text-[#1F9E76] ml-1">
                g
              </span>
            </div>

            <div className="text-[#5B6B65] text-xs">
              Total protein
            </div>
          </div>

          <div className="glass-card p-4 sm:p-5 rounded-2xl min-h-[120px] sm:min-h-[140px] flex flex-col justify-between">
            <div className="text-[#5B6B65] text-xs font-semibold tracking-wide">
              CARBS
            </div>

            <div className="font-mono text-2xl sm:text-3xl font-bold text-[#10241E] tracking-tight my-1">
              {loading
                ? "—"
                : totals.carbs_g.toFixed(1)}

              <span className="text-xs font-semibold text-[#1F9E76] ml-1">
                g
              </span>
            </div>

            <div className="text-[#5B6B65] text-xs">
              Total carbohydrates
            </div>
          </div>

          <div className="glass-card p-4 sm:p-5 rounded-2xl min-h-[120px] sm:min-h-[140px] flex flex-col justify-between">
            <div className="text-[#5B6B65] text-xs font-semibold tracking-wide">
              FAT
            </div>

            <div className="font-mono text-2xl sm:text-3xl font-bold text-[#10241E] tracking-tight my-1">
              {loading
                ? "—"
                : totals.fat_g.toFixed(1)}

              <span className="text-xs font-semibold text-[#1F9E76] ml-1">
                g
              </span>
            </div>

            <div className="text-[#5B6B65] text-xs">
              Total fat
            </div>
          </div>

        </section>

        {/* =================================================
            DAILY TARGETS
        ================================================= */}

        <section className="mb-8">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5">

            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#10241E]">
              Daily Targets
            </h2>

            <div className="flex items-center justify-between sm:justify-start gap-3">

              <span className="text-[#5B6B65] text-xs sm:text-sm">
                AI personalized
              </span>

              <button
                className="px-3.5 py-1.5 text-xs font-semibold text-[#1F9E76] bg-[#1F9E76]/10 border border-[#1F9E76]/30 rounded-full hover:bg-[#1F9E76]/20 transition-all cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed"
                onClick={recalculateTargets}
                disabled={recalculating}
              >
                {recalculating
                  ? "Recalculating..."
                  : "Recalculate"}
              </button>

            </div>

          </div>

          <div className="glass-card p-4 sm:p-6 rounded-2xl">

            {targetSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-[#1F9E76]/10 border border-[#1F9E76]/25 text-[#1F9E76] text-xs sm:text-sm font-medium">
                {targetSuccess}
              </div>
            )}

            {targetsLoading ? (
              <div className="p-6 text-center border border-dashed border-[#10241E]/20 rounded-xl text-[#5B6B65] text-sm bg-white/40">
                <div>
                  Loading your personalized
                  nutrition targets...
                  <div className="text-xs text-[#5B6B65] mt-1">
                    Using your saved AI targets.
                  </div>
                </div>
              </div>
            ) : targetsError ? (
              <div className="p-5 text-center border border-dashed border-[#10241E]/20 rounded-xl text-[#5B6B65] text-sm bg-white/40 leading-relaxed">
                <strong className="text-[#10241E]">
                  Daily targets unavailable
                </strong>

                <br />

                {targetsError}
              </div>
            ) : (
              <div className="space-y-4">
                {targetRows.map((item) => {

                  const progress =
                    getProgress(
                      item.current,
                      item.target
                    );

                  return (
                    <div
                      className="flex flex-col gap-1.5"
                      key={item.label}
                    >

                      <div className="flex items-center justify-between gap-3 text-xs sm:text-sm">

                        <span className="font-semibold text-[#10241E]">
                          {item.label}
                        </span>

                        <span className="font-mono text-[#5B6B65]">

                          <span className="font-bold text-[#10241E]">
                            {item.current}
                          </span>

                          {" / "}

                          {item.target}{" "}
                          {item.unit}

                        </span>

                      </div>

                      <div className="w-full h-2.5 bg-[#10241E]/8 rounded-full overflow-hidden">

                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            progress >= 100
                              ? "bg-gradient-to-r from-[#1F9E76] to-[#059669]"
                              : "bg-gradient-to-r from-[#1F9E76] to-[#34D399]"
                          }`}
                          style={{
                            width: `${progress}%`,
                          }}
                        />

                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </section>

        {/* =================================================
            AI DAILY GUIDANCE
        ================================================= */}

        <section className="mb-8">

          <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-[#D9F2E6]/60 to-white/70 backdrop-blur-md border border-white/90 shadow-xs">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">

              <div>
                <h2 className="font-display text-lg sm:text-xl font-bold text-[#10241E]">
                  AI Daily Guidance
                </h2>

                <div className="text-[#5B6B65] text-xs mt-0.5">
                  Gemini compares today's intake
                  with your nutrition targets.
                </div>
              </div>

              <button
                className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-white bg-[#1F9E76] hover:bg-[#178361] rounded-full shadow-md transition-all cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed shrink-0"
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
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-600 text-xs sm:text-sm">
                {guidanceError}
              </div>
            )}

            {guidance && (
              <div className="p-4 rounded-xl bg-white/75 border border-[#10241E]/8 text-[#10241E] text-xs sm:text-sm leading-relaxed">
                <span className="block text-[#1F9E76] text-[11px] font-bold tracking-wider uppercase mb-1.5">
                  Today's insight
                </span>

                {guidance}
              </div>
            )}

            {!guidance &&
              !guidanceError &&
              !guidanceLoading && (
                <div className="p-5 text-center border border-dashed border-[#10241E]/15 rounded-xl text-[#5B6B65] text-xs sm:text-sm bg-white/40">
                  Click "Get Today's Guidance" to
                  have Gemini review today's
                  nutrition.
                </div>
              )}

            {guidanceLoading && (
              <div className="p-5 text-center border border-dashed border-[#10241E]/15 rounded-xl text-[#1F9E76] font-medium text-xs sm:text-sm bg-white/40 animate-pulse">
                Gemini is reviewing today's
                nutrition against your targets...
              </div>
            )}

          </div>

        </section>

        {/* =================================================
            TODAY'S MEALS
        ================================================= */}

        <section className="mt-8">

          <div className="flex items-center justify-between gap-2 mb-4">

            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#10241E]">
              Today's Meals
            </h2>

            <div className="flex items-center gap-3">

              <span className="text-[#5B6B65] text-xs sm:text-sm">
                {foods.length}{" "}
                {foods.length === 1
                  ? "entry"
                  : "entries"}
              </span>

              <button
                className="px-3.5 py-1.5 text-xs font-semibold text-[#1F9E76] bg-[#1F9E76]/10 border border-[#1F9E76]/30 rounded-full hover:bg-[#1F9E76]/20 transition-all cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed"
                onClick={loadDashboard}
                disabled={loading}
              >
                {loading
                  ? "Loading..."
                  : "Refresh"}
              </button>

            </div>

          </div>

          {loading ? (
            <div className="p-6 text-center border border-dashed border-[#10241E]/20 rounded-2xl text-[#5B6B65] text-sm bg-white/40">
              Loading today's food...
            </div>
          ) : foods.length === 0 ? (
            <div className="p-6 text-center border border-dashed border-[#10241E]/20 rounded-2xl text-[#5B6B65] text-sm bg-white/40">
              No food logged today yet.
            </div>
          ) : (
            <div className="flex flex-col gap-3.5">
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
  );
}