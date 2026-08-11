import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();

  const [form, setForm] = useState({
    age: "",
    weight_kg: "",
    height_cm: "",
    activity_level: "",
    goal: "",
    health_conditions: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  /*
  =========================================================
  LOAD EXISTING PROFILE
  =========================================================
  */

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    loadProfile();
  }, [user]);

  async function loadProfile() {
    try {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Profile loading error:", error);
        setError(error.message);
        return;
      }

      if (data) {
        setForm({
          age: data.age ?? "",
          weight_kg: data.weight_kg ?? "",
          height_cm: data.height_cm ?? "",
          activity_level: data.activity_level ?? "",
          goal: data.goal ?? "",
          health_conditions: data.health_conditions ?? "",
        });
      }
    } catch (err) {
      console.error("Unexpected profile error:", err);

      setError(
        "Unable to load your profile. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  /*
  =========================================================
  INPUT HANDLER
  =========================================================
  */

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setMessage("");
  }

  /*
  =========================================================
  SAVE PROFILE
  =========================================================
  */

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!user) {
      setError("You must be logged in to save your profile.");
      return;
    }

    if (!form.age) {
      setError("Please enter your age.");
      return;
    }

    if (!form.weight_kg) {
      setError("Please enter your weight.");
      return;
    }

    if (!form.height_cm) {
      setError("Please enter your height.");
      return;
    }

    if (!form.activity_level) {
      setError("Please select your activity level.");
      return;
    }

    if (!form.goal) {
      setError("Please select your goal.");
      return;
    }

    const age = Number(form.age);
    const weight = Number(form.weight_kg);
    const height = Number(form.height_cm);

    if (!Number.isFinite(age) || age <= 0) {
      setError("Please enter a valid age.");
      return;
    }

    if (!Number.isFinite(weight) || weight <= 0) {
      setError("Please enter a valid weight.");
      return;
    }

    if (!Number.isFinite(height) || height <= 0) {
      setError("Please enter a valid height.");
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .upsert(
          {
            id: user.id,
            age,
            weight_kg: weight,
            height_cm: height,
            activity_level: form.activity_level,
            goal: form.goal,
            health_conditions:
              form.health_conditions.trim() || null,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "id",
          }
        );

      if (error) {
        console.error(
          "Profile save error:",
          error
        );

        setError(error.message);
        return;
      }

      setMessage(
        "Profile saved successfully!"
      );
    } catch (err) {
      console.error(
        "Unexpected profile save error:",
        err
      );

      setError(
        "Unable to save your profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center text-[#5B6B65] text-base">
        Loading your profile...
      </div>
    );
  }

  return (
    <main className="min-h-[calc(100vh-64px)] px-4 py-8 sm:px-6 sm:py-12 text-[#10241E]">
      <div className="w-full max-w-2xl mx-auto">

        <div className="text-[#1F9E76] text-xs font-bold tracking-widest uppercase mb-2">
          HQ DOPAMINE
        </div>

        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#10241E] tracking-tight leading-tight">
          Your Profile
        </h1>

        <p className="mt-2.5 mb-8 text-[#5B6B65] text-sm sm:text-base leading-relaxed">
          Tell us a little about yourself so we can
          calculate personalized daily nutrition targets.
        </p>

        <section className="glass-card p-5 sm:p-8 rounded-2xl">

          <h2 className="font-display text-xl sm:text-2xl font-bold text-[#10241E] mb-6">
            Nutrition Profile
          </h2>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl text-xs sm:text-sm bg-red-500/10 border border-red-500/25 text-red-600">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-5 p-3.5 rounded-xl text-xs sm:text-sm bg-[#1F9E76]/10 border border-[#1F9E76]/25 text-[#1F9E76] font-medium">
              {message}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5"
          >

            {/* AGE + WEIGHT ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div className="flex flex-col gap-1.5">
                <label className="text-[#10241E] text-xs sm:text-sm font-semibold">
                  Age
                </label>

                <input
                  type="number"
                  name="age"
                  value={form.age}
                  onChange={handleChange}
                  placeholder="e.g. 25"
                  min="1"
                  max="120"
                  className="glass-input"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[#10241E] text-xs sm:text-sm font-semibold">
                  Weight (kg)
                </label>

                <input
                  type="number"
                  name="weight_kg"
                  value={form.weight_kg}
                  onChange={handleChange}
                  placeholder="e.g. 70"
                  min="1"
                  step="0.1"
                  className="glass-input"
                />
              </div>

            </div>

            {/* HEIGHT */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[#10241E] text-xs sm:text-sm font-semibold">
                Height (cm)
              </label>

              <input
                type="number"
                name="height_cm"
                value={form.height_cm}
                onChange={handleChange}
                placeholder="e.g. 175"
                min="1"
                step="0.1"
                className="glass-input"
              />
            </div>

            {/* ACTIVITY */}
            <div className="flex flex-col gap-1.5">

              <label className="text-[#10241E] text-xs sm:text-sm font-semibold">
                Activity Level
              </label>

              <select
                name="activity_level"
                value={form.activity_level}
                onChange={handleChange}
                className="glass-input cursor-pointer"
              >
                <option value="">
                  Select activity level
                </option>

                <option value="sedentary">
                  Sedentary — little or no exercise
                </option>

                <option value="lightly_active">
                  Lightly active — 1–3 days/week
                </option>

                <option value="moderately_active">
                  Moderately active — 3–5 days/week
                </option>

                <option value="very_active">
                  Very active — 6–7 days/week
                </option>

                <option value="extremely_active">
                  Extremely active — hard training/physical job
                </option>
              </select>

            </div>

            {/* GOAL */}
            <div className="flex flex-col gap-1.5">

              <label className="text-[#10241E] text-xs sm:text-sm font-semibold">
                Goal
              </label>

              <select
                name="goal"
                value={form.goal}
                onChange={handleChange}
                className="glass-input cursor-pointer"
              >
                <option value="">
                  Select your goal
                </option>

                <option value="lose_weight">
                  Lose weight
                </option>

                <option value="maintain_weight">
                  Maintain weight
                </option>

                <option value="gain_weight">
                  Gain weight
                </option>

                <option value="build_muscle">
                  Build muscle
                </option>
              </select>

            </div>

            {/* HEALTH CONDITIONS */}
            <div className="flex flex-col gap-1.5">

              <label className="text-[#10241E] text-xs sm:text-sm font-semibold">
                Health Conditions
              </label>

              <textarea
                name="health_conditions"
                value={form.health_conditions}
                onChange={handleChange}
                placeholder="Optional — enter any relevant conditions or dietary considerations."
                className="glass-input min-h-[90px] resize-y"
              />

              <div className="text-[#5B6B65] text-xs mt-1">
                Leave this blank if there is nothing you
                want to report.
              </div>

            </div>

            {/* SAVE */}
            <button
              type="submit"
              disabled={saving}
              className="mt-2 w-full py-3.5 px-6 bg-[#1F9E76] text-white text-base font-semibold rounded-full shadow-md hover:bg-[#178361] transition-all cursor-pointer disabled:opacity-65 disabled:cursor-not-allowed"
            >
              {saving
                ? "Saving profile..."
                : "Save Profile"}
            </button>

          </form>

        </section>

      </div>
    </main>
  );
}