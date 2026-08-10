import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const styles = {
  page: {
    minHeight: '100vh',
    boxSizing: 'border-box',
    padding: '40px 20px 80px',
    background:
      'radial-gradient(circle at 0% 0%, rgba(102, 31, 255, 0.24), transparent 38%), #09090d',
    color: '#f5f5f7',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
  },

  container: {
    width: '100%',
    maxWidth: '620px',
    margin: '0 auto',
  },

  eyebrow: {
    marginBottom: '8px',
    color: '#a78bfa',
    fontSize: '12px',
    fontWeight: '700',
    letterSpacing: '2px',
    textTransform: 'uppercase',
  },

  title: {
    margin: 0,
    color: '#ffffff',
    fontSize: '34px',
    fontWeight: '800',
    letterSpacing: '-1px',
  },

  subtitle: {
    margin: '10px 0 28px',
    color: '#8d8da1',
    fontSize: '14px',
    lineHeight: '1.6',
  },

  card: {
    padding: '24px',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '16px',
    background: 'rgba(18,18,24,0.86)',
    boxShadow:
      '0 18px 40px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.025)',
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },

  group: {
    display: 'flex',
    flexDirection: 'column',
    gap: '7px',
  },

  label: {
    color: '#ddddE7',
    fontSize: '13px',
    fontWeight: '700',
  },

  input: {
    boxSizing: 'border-box',
    width: '100%',
    padding: '12px 14px',
    border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: '9px',
    outline: 'none',
    background: '#0f0f15',
    color: '#ffffff',
    fontSize: '14px',
  },

  select: {
    boxSizing: 'border-box',
    width: '100%',
    padding: '12px 14px',
    border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: '9px',
    outline: 'none',
    background: '#0f0f15',
    color: '#ffffff',
    fontSize: '14px',
  },

  textarea: {
    boxSizing: 'border-box',
    width: '100%',
    minHeight: '90px',
    padding: '12px 14px',
    border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: '9px',
    outline: 'none',
    resize: 'vertical',
    background: '#0f0f15',
    color: '#ffffff',
    fontSize: '14px',
    fontFamily: 'inherit',
  },

  hint: {
    color: '#666676',
    fontSize: '11px',
    lineHeight: '1.5',
  },

  error: {
    padding: '12px 14px',
    border: '1px solid rgba(248,113,113,0.20)',
    borderRadius: '9px',
    background: 'rgba(248,113,113,0.08)',
    color: '#fca5a5',
    fontSize: '13px',
  },

  success: {
    padding: '12px 14px',
    border: '1px solid rgba(74,222,128,0.20)',
    borderRadius: '9px',
    background: 'rgba(74,222,128,0.08)',
    color: '#86efac',
    fontSize: '13px',
  },

  button: {
    marginTop: '5px',
    padding: '13px 16px',
    border: 'none',
    borderRadius: '9px',
    background: 'linear-gradient(90deg, #7c3aed, #8b5cf6)',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '800',
    cursor: 'pointer',
  },
};

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
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.card}>
            Loading your profile...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        <div style={styles.eyebrow}>
          HQ DOPAMINE
        </div>

        <h1 style={styles.title}>
          Set up your profile
        </h1>

        <p style={styles.subtitle}>
          We will use this information to estimate your daily nutrition
          targets and personalize your dashboard.
        </p>

        <div style={styles.card}>

          {error && (
            <div style={{ ...styles.error, marginBottom: '18px' }}>
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            style={styles.form}
          >

            <div style={styles.group}>
              <label style={styles.label}>
                Age *
              </label>

              <input
                type="number"
                min="13"
                max="120"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 24"
                style={styles.input}
              />
            </div>

            <div style={styles.group}>
              <label style={styles.label}>
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
                style={styles.input}
              />
            </div>

            <div style={styles.group}>
              <label style={styles.label}>
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
                style={styles.input}
              />
            </div>

            <div style={styles.group}>
              <label style={styles.label}>
                Activity level *
              </label>

              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value)}
                style={styles.select}
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

            <div style={styles.group}>
              <label style={styles.label}>
                Goal *
              </label>

              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                style={styles.select}
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

            <div style={styles.group}>
              <label style={styles.label}>
                Health conditions
              </label>

              <textarea
                value={healthConditions}
                onChange={(e) =>
                  setHealthConditions(e.target.value)
                }
                placeholder="Optional. Enter any relevant conditions or dietary considerations."
                style={styles.textarea}
              />

              <div style={styles.hint}>
                Optional. Leave blank if there is nothing to report.
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              style={{
                ...styles.button,
                opacity: saving ? 0.65 : 1,
                cursor: saving ? 'not-allowed' : 'pointer',
              }}
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