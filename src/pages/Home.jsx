import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

const styles = {
  page: {
    minHeight: "calc(100vh - 64px)",
    boxSizing: "border-box",
    padding: "50px 20px 80px",
    color: "#10241E",
    fontFamily: "var(--font-body)",
  },

  container: {
    width: "100%",
    maxWidth: "700px",
    margin: "0 auto",
  },

  eyebrow: {
    marginBottom: "8px",
    color: "#1F9E76",
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "2px",
    textTransform: "uppercase",
  },

  title: {
    margin: 0,
    color: "#10241E",
    fontFamily: "var(--font-display)",
    fontSize: "40px",
    lineHeight: "1.1",
    fontWeight: "700",
    letterSpacing: "-0.5px",
  },

  subtitle: {
    margin: "10px 0 30px",
    color: "#5B6B65",
    fontSize: "15px",
    lineHeight: "1.6",
  },

  card: {
    padding: "32px",
    border: "1px solid rgba(255, 255, 255, 0.9)",
    borderRadius: "20px",
    background: "rgba(255, 255, 255, 0.65)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    boxShadow: "0 14px 36px rgba(16, 36, 30, 0.06)",
  },

  sectionTitle: {
    margin: "0 0 24px",
    color: "#10241E",
    fontFamily: "var(--font-display)",
    fontSize: "24px",
    fontWeight: "700",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },

  label: {
    color: "#10241E",
    fontSize: "13px",
    fontWeight: "600",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 14px",
    border: "1px solid rgba(16, 36, 30, 0.12)",
    borderRadius: "12px",
    outline: "none",
    background: "rgba(255, 255, 255, 0.8)",
    color: "#10241E",
    fontSize: "14px",
  },

  select: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 14px",
    border: "1px solid rgba(16, 36, 30, 0.12)",
    borderRadius: "12px",
    outline: "none",
    background: "rgba(255, 255, 255, 0.8)",
    color: "#10241E",
    fontSize: "14px",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    minHeight: "90px",
    resize: "vertical",
    padding: "12px 14px",
    border: "1px solid rgba(16, 36, 30, 0.12)",
    borderRadius: "12px",
    outline: "none",
    background: "rgba(255, 255, 255, 0.8)",
    color: "#10241E",
    fontSize: "14px",
    fontFamily: "inherit",
  },

  hint: {
    marginTop: "4px",
    color: "#5B6B65",
    fontSize: "12px",
    lineHeight: "1.5",
  },

  button: {
    marginTop: "8px",
    padding: "14px 24px",
    border: "none",
    borderRadius: "999px",
    background: "#1F9E76",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(31, 158, 118, 0.25)",
    transition: "all 0.2s ease",
  },

  message: {
    marginBottom: "18px",
    padding: "12px 14px",
    borderRadius: "10px",
    fontSize: "13px",
  },

  error: {
    background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.25)",
    color: "#dc2626",
  },

  success: {
    background: "rgba(31, 158, 118, 0.1)",
    border: "1px solid rgba(31, 158, 118, 0.25)",
    color: "#1F9E76",
  },

  loading: {
    minHeight: "calc(100vh - 64px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#5B6B65",
    fontFamily: "var(--font-body)",
    fontSize: "15px",
  },
};

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

      /*
       * Your profiles table uses the authenticated user's
       * UUID as the "id" column.
       */

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

    /*
    Basic validation
    */

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

    /*
    Convert numeric fields to numbers
    */

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
      /*
      =======================================================
      UPSERT PROFILE
      =======================================================
      */

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

  /*
  =========================================================
  LOADING
  =========================================================
  */

  if (loading) {
    return (
      <div style={styles.loading}>
        Loading your profile...
      </div>
    );
  }

  /*
  =========================================================
  PAGE
  =========================================================
  */

  return (
    <main style={styles.page}>
      <div style={styles.container}>

        <div style={styles.eyebrow}>
          HQ DOPAMINE
        </div>

        <h1 style={styles.title}>
          Your Profile
        </h1>

        <p style={styles.subtitle}>
          Tell us a little about yourself so we can
          calculate personalized daily nutrition targets.
        </p>

        <section style={styles.card}>

          <h2 style={styles.sectionTitle}>
            Nutrition Profile
          </h2>

          {error && (
            <div
              style={{
                ...styles.message,
                ...styles.error,
              }}
            >
              {error}
            </div>
          )}

          {message && (
            <div
              style={{
                ...styles.message,
                ...styles.success,
              }}
            >
              {message}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            style={styles.form}
          >

            {/* AGE + WEIGHT */}

            <div style={styles.row}>

              <div style={styles.field}>
                <label style={styles.label}>
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
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>
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
                  style={styles.input}
                />
              </div>

            </div>

            {/* HEIGHT */}

            <div style={styles.field}>
              <label style={styles.label}>
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
                style={styles.input}
              />
            </div>

            {/* ACTIVITY */}

            <div style={styles.field}>

              <label style={styles.label}>
                Activity Level
              </label>

              <select
                name="activity_level"
                value={form.activity_level}
                onChange={handleChange}
                style={styles.select}
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

            <div style={styles.field}>

              <label style={styles.label}>
                Goal
              </label>

              <select
                name="goal"
                value={form.goal}
                onChange={handleChange}
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

            {/* HEALTH CONDITIONS */}

            <div style={styles.field}>

              <label style={styles.label}>
                Health Conditions
              </label>

              <textarea
                name="health_conditions"
                value={form.health_conditions}
                onChange={handleChange}
                placeholder="Optional — enter any relevant conditions or dietary considerations."
                style={styles.textarea}
              />

              <div style={styles.hint}>
                Leave this blank if there is nothing you
                want to report.
              </div>

            </div>

            {/* SAVE */}

            <button
              type="submit"
              disabled={saving}
              style={{
                ...styles.button,
                opacity: saving ? 0.65 : 1,
                cursor: saving
                  ? "not-allowed"
                  : "pointer",
              }}
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