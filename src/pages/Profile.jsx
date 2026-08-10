import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const styles = `
  .hq-profile {
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

  .hq-profile-container {
    width: 100%;
    max-width: 700px;
    margin: 0 auto;
  }

  .hq-profile-header {
    margin-bottom: 28px;
  }

  .hq-profile-eyebrow {
    margin-bottom: 8px;
    color: #a78bfa;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
  }

  .hq-profile-title {
    margin: 0;
    color: #ffffff;
    font-size: 36px;
    line-height: 1.1;
    font-weight: 800;
    letter-spacing: -1px;
  }

  .hq-profile-subtitle {
    margin: 10px 0 0;
    color: #8d8da1;
    font-size: 14px;
    line-height: 1.6;
  }

  .hq-profile-card {
    box-sizing: border-box;
    width: 100%;
    padding: 24px;
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 16px;
    background: rgba(18, 18, 24, 0.82);
    box-shadow:
      0 18px 40px rgba(0, 0, 0, 0.20),
      inset 0 1px 0 rgba(255, 255, 255, 0.025);
  }

  .hq-profile-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
  }

  .hq-profile-field {
    display: flex;
    flex-direction: column;
    gap: 7px;
  }

  .hq-profile-field.full {
    grid-column: 1 / -1;
  }

  .hq-profile-label {
    color: #ddddE7;
    font-size: 12px;
    font-weight: 700;
  }

  .hq-profile-input,
  .hq-profile-select,
  .hq-profile-textarea {
    box-sizing: border-box;
    width: 100%;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 9px;
    outline: none;
    background: rgba(255, 255, 255, 0.035);
    color: #ffffff;
    font-family: inherit;
    font-size: 13px;
    padding: 12px 13px;
  }

  .hq-profile-input:focus,
  .hq-profile-select:focus,
  .hq-profile-textarea:focus {
    border-color: rgba(167, 139, 250, 0.65);
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.10);
  }

  .hq-profile-select option {
    background: #121218;
    color: #ffffff;
  }

  .hq-profile-textarea {
    min-height: 100px;
    resize: vertical;
  }

  .hq-profile-help {
    color: #666676;
    font-size: 11px;
    line-height: 1.5;
  }

  .hq-profile-error {
    box-sizing: border-box;
    margin-bottom: 18px;
    padding: 13px;
    border: 1px solid rgba(248, 113, 113, 0.18);
    border-radius: 9px;
    background: rgba(248, 113, 113, 0.08);
    color: #fca5a5;
    font-size: 13px;
  }

  .hq-profile-success {
    box-sizing: border-box;
    margin-bottom: 18px;
    padding: 13px;
    border: 1px solid rgba(74, 222, 128, 0.18);
    border-radius: 9px;
    background: rgba(74, 222, 128, 0.08);
    color: #86efac;
    font-size: 13px;
  }

  .hq-profile-button {
    width: 100%;
    margin-top: 24px;
    border: none;
    border-radius: 9px;
    padding: 13px 16px;
    background: linear-gradient(
      90deg,
      #8b5cf6,
      #a78bfa
    );
    color: #ffffff;
    font-family: inherit;
    font-size: 13px;
    font-weight: 800;
    cursor: pointer;
  }

  .hq-profile-button:hover {
    opacity: 0.92;
  }

  .hq-profile-button:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  @media (max-width: 600px) {
    .hq-profile {
      padding: 28px 14px 60px;
    }

    .hq-profile-title {
      font-size: 30px;
    }

    .hq-profile-card {
      padding: 18px;
    }

    .hq-profile-grid {
      grid-template-columns: 1fr;
    }

    .hq-profile-field.full {
      grid-column: auto;
    }
  }
`;

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

      setSuccess('Profile saved successfully.');

      setTimeout(() => {
        navigate('/dashboard');
      }, 700);
    } catch (err) {
      console.error('Unexpected profile save error:', err);
      setError('Unable to save your profile.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <style>{styles}</style>

      <main className="hq-profile">
        <div className="hq-profile-container">

          <header className="hq-profile-header">
            <div className="hq-profile-eyebrow">
              HQ DOPAMINE
            </div>

            <h1 className="hq-profile-title">
              Your Profile
            </h1>

            <p className="hq-profile-subtitle">
              Tell us a little about yourself so we can
              calculate more personalized nutrition targets.
            </p>
          </header>

          {error && (
            <div className="hq-profile-error">
              {error}
            </div>
          )}

          {success && (
            <div className="hq-profile-success">
              {success}
            </div>
          )}

          <form
            className="hq-profile-card"
            onSubmit={handleSubmit}
          >
            {loading ? (
              <div className="hq-profile-help">
                Loading your profile...
              </div>
            ) : (
              <>
                <div className="hq-profile-grid">

                  <div className="hq-profile-field">
                    <label
                      className="hq-profile-label"
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
                      className="hq-profile-input"
                      placeholder="e.g. 25"
                      required
                    />
                  </div>

                  <div className="hq-profile-field">
                    <label
                      className="hq-profile-label"
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
                      className="hq-profile-input"
                      placeholder="e.g. 70"
                      required
                    />
                  </div>

                  <div className="hq-profile-field">
                    <label
                      className="hq-profile-label"
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
                      className="hq-profile-input"
                      placeholder="e.g. 175"
                      required
                    />
                  </div>

                  <div className="hq-profile-field">
                    <label
                      className="hq-profile-label"
                      htmlFor="activity_level"
                    >
                      Activity Level *
                    </label>

                    <select
                      id="activity_level"
                      name="activity_level"
                      value={form.activity_level}
                      onChange={handleChange}
                      className="hq-profile-select"
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

                  <div className="hq-profile-field full">
                    <label
                      className="hq-profile-label"
                      htmlFor="goal"
                    >
                      Goal *
                    </label>

                    <select
                      id="goal"
                      name="goal"
                      value={form.goal}
                      onChange={handleChange}
                      className="hq-profile-select"
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

                  <div className="hq-profile-field full">
                    <label
                      className="hq-profile-label"
                      htmlFor="health_conditions"
                    >
                      Health conditions
                    </label>

                    <textarea
                      id="health_conditions"
                      name="health_conditions"
                      value={form.health_conditions}
                      onChange={handleChange}
                      className="hq-profile-textarea"
                      placeholder="Optional. Enter any relevant conditions, or leave blank."
                    />

                    <div className="hq-profile-help">
                      This is optional and will be used only as
                      profile context for nutrition target estimates.
                    </div>
                  </div>

                </div>

                <button
                  type="submit"
                  className="hq-profile-button"
                  disabled={saving}
                >
                  {saving
                    ? 'Saving profile...'
                    : 'Save Profile'}
                </button>
              </>
            )}
          </form>

        </div>
      </main>
    </>
  );
}