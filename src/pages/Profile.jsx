import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { analyzeDailyTargets } from '../lib/gemini';

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    age: '',
    weight_kg: '',
    height_cm: '',
    activity_level: '',
    goal: '',
    health_conditions: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadProfile();
  }, [user]);

  async function loadProfile() {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

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
        setForm({
          age: data.age ?? '',
          weight_kg: data.weight_kg ?? '',
          height_cm: data.height_cm ?? '',
          activity_level: data.activity_level ?? '',
          goal: data.goal ?? '',
          health_conditions: data.health_conditions ?? '',
        });
      }
    } catch (err) {
      console.error('Unexpected profile error:', err);
      setError('Unable to load your profile.');
    } finally {
      setLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!user) {
      setError('You must be logged in to save your profile.');
      return;
    }

    setError('');
    setSuccess('');

    if (
      !form.age ||
      !form.weight_kg ||
      !form.height_cm ||
      !form.activity_level ||
      !form.goal
    ) {
      setError('Please complete all required fields.');
      return;
    }

    setSaving(true);

    try {
      const profileData = {
        id: user.id,
        age: Number(form.age),
        weight_kg: Number(form.weight_kg),
        height_cm: Number(form.height_cm),
        activity_level: form.activity_level,
        goal: form.goal,
        health_conditions:
          form.health_conditions.trim() || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(profileData, {
          onConflict: 'id',
        });

      if (error) {
        console.error('Profile save error:', error);
        setError(error.message);
        return;
      }

      setSuccess('Profile saved successfully!');

      // Check if user has an active daily target
      const { data: existingTarget } = await supabase
        .from('daily_targets')
        .select('id')
        .eq('user_id', user.id)
        .eq('active', true)
        .maybeSingle();

      // If first time save (no active daily target), auto-generate targets
      if (!existingTarget) {
        try {
          const targets = await analyzeDailyTargets({
            age: profileData.age,
            weight_kg: profileData.weight_kg,
            height_cm: profileData.height_cm,
            activity_level: profileData.activity_level,
            goal: profileData.goal,
            health_conditions: profileData.health_conditions || 'none reported',
          });

          if (targets && typeof targets.calories === 'number') {
            await supabase
              .from('daily_targets')
              .update({ active: false })
              .eq('user_id', user.id)
              .eq('active', true);

            await supabase
              .from('daily_targets')
              .insert({
                user_id: user.id,
                calories: targets.calories,
                protein_g: targets.protein_g,
                carbs_g: targets.carbs_g,
                fat_g: targets.fat_g,
                fiber_g: targets.fiber_g,
                iron_mg: targets.iron_mg,
                calcium_mg: targets.calcium_mg,
                active: true,
                generated_at: new Date().toISOString(),
              });
          }
        } catch (targetErr) {
          console.warn('Auto target calculation notice:', targetErr);
        }
      }

      navigate('/dashboard');
    } catch (err) {
      console.error('Unexpected profile save error:', err);
      setError('Unable to save your profile.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-64px)] px-4 py-8 sm:px-6 sm:py-12 text-[#10241E]">
      <div className="w-full max-w-2xl mx-auto">

        <header className="mb-7">
          <div className="text-[#1F9E76] text-xs font-bold tracking-widest uppercase mb-2">
            HQ DOPAMINE
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#10241E] tracking-tight leading-tight">
            Your Profile
          </h1>

          <p className="mt-2.5 text-[#5B6B65] text-sm sm:text-base leading-relaxed">
            Tell us a little about yourself so we can
            calculate more personalized nutrition targets.
          </p>
        </header>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl text-xs sm:text-sm bg-red-500/10 border border-red-500/25 text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 p-3.5 rounded-xl text-xs sm:text-sm bg-[#1F9E76]/10 border border-[#1F9E76]/25 text-[#1F9E76] font-medium">
            {success}
          </div>
        )}

        <form
          className="glass-card p-5 sm:p-8 rounded-2xl"
          onSubmit={handleSubmit}
        >
          {loading ? (
            <div className="text-[#5B6B65] text-sm text-center py-4">
              Loading your profile...
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div className="flex flex-col gap-1.5">
                  <label
                    className="text-[#10241E] text-xs sm:text-sm font-semibold"
                    htmlFor="age"
                  >
                    Age *
                  </label>

                  <input
                    id="age"
                    name="age"
                    type="number"
                    min="1"
                    max="120"
                    value={form.age}
                    onChange={handleChange}
                    className="glass-input"
                    placeholder="e.g. 25"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    className="text-[#10241E] text-xs sm:text-sm font-semibold"
                    htmlFor="weight_kg"
                  >
                    Weight (kg) *
                  </label>

                  <input
                    id="weight_kg"
                    name="weight_kg"
                    type="number"
                    min="1"
                    step="0.1"
                    value={form.weight_kg}
                    onChange={handleChange}
                    className="glass-input"
                    placeholder="e.g. 70"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    className="text-[#10241E] text-xs sm:text-sm font-semibold"
                    htmlFor="height_cm"
                  >
                    Height (cm) *
                  </label>

                  <input
                    id="height_cm"
                    name="height_cm"
                    type="number"
                    min="50"
                    max="250"
                    step="0.1"
                    value={form.height_cm}
                    onChange={handleChange}
                    className="glass-input"
                    placeholder="e.g. 175"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    className="text-[#10241E] text-xs sm:text-sm font-semibold"
                    htmlFor="activity_level"
                  >
                    Activity Level *
                  </label>

                  <select
                    id="activity_level"
                    name="activity_level"
                    value={form.activity_level}
                    onChange={handleChange}
                    className="glass-input cursor-pointer"
                    required
                  >
                    <option value="">
                      Select activity level
                    </option>

                    <option value="sedentary">
                      Sedentary
                    </option>

                    <option value="light">
                      Lightly active
                    </option>

                    <option value="moderate">
                      Moderately active
                    </option>

                    <option value="very_active">
                      Very active
                    </option>

                    <option value="extra_active">
                      Extremely active
                    </option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label
                    className="text-[#10241E] text-xs sm:text-sm font-semibold"
                    htmlFor="goal"
                  >
                    Goal *
                  </label>

                  <select
                    id="goal"
                    name="goal"
                    value={form.goal}
                    onChange={handleChange}
                    className="glass-input cursor-pointer"
                    required
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
                  </select>
                </div>

                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label
                    className="text-[#10241E] text-xs sm:text-sm font-semibold"
                    htmlFor="health_conditions"
                  >
                    Health conditions
                  </label>

                  <textarea
                    id="health_conditions"
                    name="health_conditions"
                    value={form.health_conditions}
                    onChange={handleChange}
                    className="glass-input min-h-[100px] resize-y"
                    placeholder="Optional. Enter any relevant conditions, or leave blank."
                  />

                  <div className="text-[#5B6B65] text-xs mt-1">
                    This is optional and will be used only as
                    profile context for nutrition target estimates.
                  </div>
                </div>

              </div>

              <button
                type="submit"
                className="mt-2 w-full py-3.5 px-6 bg-[#1F9E76] text-white text-base font-semibold rounded-full shadow-md hover:bg-[#178361] transition-all cursor-pointer disabled:opacity-65 disabled:cursor-not-allowed"
                disabled={saving}
              >
                {saving
                  ? 'Saving profile...'
                  : 'Save Profile'}
              </button>
            </div>
          )}
        </form>

      </div>
    </main>
  );
}