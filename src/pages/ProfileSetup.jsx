import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function ProfileSetup() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [activityLevel, setActivityLevel] = useState('');
  const [goal, setGoal] = useState('');
  const [healthConditions, setHealthConditions] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;

    loadProfile();
  }, [user]);

  async function loadProfile() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Profile loading error:', error);
        setError(error.message);
        return;
      }

      if (data) {
        setAge(data.age ?? '');
        setWeight(data.weight_kg ?? '');
        setHeight(data.height_cm ?? '');
        setActivityLevel(data.activity_level ?? '');
        setGoal(data.goal ?? '');
        setHealthConditions(data.health_conditions ?? '');
      }
    } catch (err) {
      console.error('Unexpected profile loading error:', err);
      setError('Unable to load your profile.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError('');

    if (!age || !weight || !height || !activityLevel || !goal) {
      setError('Please complete all required fields.');
      return;
    }

    const ageNumber = Number(age);
    const weightNumber = Number(weight);
    const heightNumber = Number(height);

    if (ageNumber < 13 || ageNumber > 120) {
      setError('Please enter a valid age.');
      return;
    }

    if (weightNumber <= 0 || weightNumber > 500) {
      setError('Please enter a valid weight.');
      return;
    }

    if (heightNumber <= 0 || heightNumber > 250) {
      setError('Please enter a valid height.');
      return;
    }

    setSaving(true);

    try {
      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert(
          {
            id: user.id,
            age: ageNumber,
            weight_kg: weightNumber,
            height_cm: heightNumber,
            activity_level: activityLevel,
            goal,
            health_conditions:
              healthConditions.trim() || null,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'id',
          }
        );

      if (upsertError) {
        console.error('Profile save error:', upsertError);
        throw upsertError;
      }

      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Profile setup error:', err);
      setError(
        err?.message || 'Unable to save your profile. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen px-4 py-8 sm:px-6 sm:py-12 text-[#10241E]">
        <div className="w-full max-w-xl mx-auto">
          <div className="glass-card p-6 sm:p-8 rounded-2xl text-center text-[#5B6B65]">
            Loading your profile...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 sm:py-12 text-[#10241E]">
      <div className="w-full max-w-xl mx-auto">

        <div className="text-[#1F9E76] text-xs font-bold tracking-widest uppercase mb-2">
          HQ DOPAMINE
        </div>

        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#10241E] tracking-tight leading-tight">
          Set up your profile
        </h1>

        <p className="mt-2.5 mb-7 text-[#5B6B65] text-sm sm:text-base leading-relaxed">
          We will use this information to estimate your daily nutrition
          targets and personalize your dashboard.
        </p>

        <div className="glass-card p-5 sm:p-8 rounded-2xl">

          {error && (
            <div className="mb-5 p-3.5 rounded-xl text-xs sm:text-sm bg-red-500/10 border border-red-500/25 text-red-600">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5"
          >

            {/* AGE + WEIGHT + HEIGHT GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[#10241E] text-xs sm:text-sm font-semibold">
                  Age *
                </label>

                <input
                  type="number"
                  min="13"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g. 24"
                  className="glass-input"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[#10241E] text-xs sm:text-sm font-semibold">
                  Weight (kg) *
                </label>

                <input
                  type="number"
                  min="1"
                  max="500"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="e.g. 70"
                  className="glass-input"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[#10241E] text-xs sm:text-sm font-semibold">
                  Height (cm) *
                </label>

                <input
                  type="number"
                  min="1"
                  max="250"
                  step="0.1"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="e.g. 175"
                  className="glass-input"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[#10241E] text-xs sm:text-sm font-semibold">
                Activity level *
              </label>

              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value)}
                className="glass-input cursor-pointer"
              >
                <option value="">
                  Select activity level
                </option>

                <option value="sedentary">
                  Sedentary — little exercise
                </option>

                <option value="light">
                  Lightly active — 1–3 days/week
                </option>

                <option value="moderate">
                  Moderately active — 3–5 days/week
                </option>

                <option value="very_active">
                  Very active — 6–7 days/week
                </option>

                <option value="extra_active">
                  Extra active — intense training/physical job
                </option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[#10241E] text-xs sm:text-sm font-semibold">
                Goal *
              </label>

              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
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

            <div className="flex flex-col gap-1.5">
              <label className="text-[#10241E] text-xs sm:text-sm font-semibold">
                Health conditions
              </label>

              <textarea
                value={healthConditions}
                onChange={(e) =>
                  setHealthConditions(e.target.value)
                }
                placeholder="Optional. Enter any relevant conditions or dietary considerations."
                className="glass-input min-h-[90px] resize-y"
              />

              <div className="text-[#5B6B65] text-xs mt-1">
                Optional. Leave blank if there is nothing to report.
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="mt-2 w-full py-3.5 px-6 bg-[#1F9E76] text-white text-base font-semibold rounded-full shadow-md hover:bg-[#178361] transition-all cursor-pointer disabled:opacity-65 disabled:cursor-not-allowed"
            >
              {saving
                ? 'Saving profile...'
                : 'Save profile and continue'}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}