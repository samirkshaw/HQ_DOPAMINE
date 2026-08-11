import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const styles = {
  page: {
    minHeight: '100vh',
    boxSizing: 'border-box',
    padding: '40px 20px 80px',
    color: '#10241E',
    fontFamily: 'var(--font-body)',
  },

  container: {
    width: '100%',
    maxWidth: '620px',
    margin: '0 auto',
  },

  eyebrow: {
    marginBottom: '8px',
    color: '#1F9E76',
    fontSize: '12px',
    fontWeight: '700',
    letterSpacing: '2px',
    textTransform: 'uppercase',
  },

  title: {
    margin: 0,
    color: '#10241E',
    fontFamily: 'var(--font-display)',
    fontSize: '36px',
    fontWeight: '700',
    letterSpacing: '-0.5px',
  },

  subtitle: {
    margin: '10px 0 28px',
    color: '#5B6B65',
    fontSize: '15px',
    lineHeight: '1.6',
  },

  card: {
    padding: '32px',
    border: '1px solid rgba(255, 255, 255, 0.9)',
    borderRadius: '20px',
    background: 'rgba(255, 255, 255, 0.65)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    boxShadow: '0 12px 32px rgba(16, 36, 30, 0.06)',
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },

  group: {
    display: 'flex',
    flexDirection: 'column',
    gap: '7px',
  },

  label: {
    color: '#10241E',
    fontSize: '13px',
    fontWeight: '600',
  },

  input: {
    boxSizing: 'border-box',
    width: '100%',
    padding: '12px 14px',
    border: '1px solid rgba(16, 36, 30, 0.12)',
    borderRadius: '12px',
    outline: 'none',
    background: 'rgba(255, 255, 255, 0.85)',
    color: '#10241E',
    fontSize: '14px',
  },

  select: {
    boxSizing: 'border-box',
    width: '100%',
    padding: '12px 14px',
    border: '1px solid rgba(16, 36, 30, 0.12)',
    borderRadius: '12px',
    outline: 'none',
    background: 'rgba(255, 255, 255, 0.85)',
    color: '#10241E',
    fontSize: '14px',
  },

  textarea: {
    boxSizing: 'border-box',
    width: '100%',
    minHeight: '90px',
    padding: '12px 14px',
    border: '1px solid rgba(16, 36, 30, 0.12)',
    borderRadius: '12px',
    outline: 'none',
    resize: 'vertical',
    background: 'rgba(255, 255, 255, 0.85)',
    color: '#10241E',
    fontSize: '14px',
    fontFamily: 'inherit',
  },

  hint: {
    color: '#5B6B65',
    fontSize: '12px',
    lineHeight: '1.5',
  },

  error: {
    padding: '12px 14px',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    borderRadius: '10px',
    background: 'rgba(239, 68, 68, 0.1)',
    color: '#dc2626',
    fontSize: '13px',
  },

  success: {
    padding: '12px 14px',
    border: '1px solid rgba(31, 158, 118, 0.25)',
    borderRadius: '10px',
    background: 'rgba(31, 158, 118, 0.1)',
    color: '#1F9E76',
    fontSize: '13px',
  },

  button: {
    marginTop: '6px',
    padding: '14px 20px',
    border: 'none',
    borderRadius: '999px',
    background: '#1F9E76',
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(31, 158, 118, 0.25)',
    transition: 'all 0.2s ease',
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