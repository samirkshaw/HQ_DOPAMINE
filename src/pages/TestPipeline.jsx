// src/pages/TestPipeline.jsx
// Scratch test page — wire this into a route (or just render it from
// App.jsx temporarily) to test the full photo -> clarify -> resolved flow.

import { useState } from "react";
import { analyzeFood, analyzeDailyTargets } from "../lib/gemini";
import ClarificationFlow from "../components/ClarificationFlow";

export default function TestPipeline() {
  const [file, setFile] = useState(null);
  const [items, setItems] = useState(null);
  const [resolvedItems, setResolvedItems] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- Daily targets test state (separate from the photo pipeline above) ---
  const [targets, setTargets] = useState(null);
  const [targetsLoading, setTargetsLoading] = useState(false);
  const [targetsError, setTargetsError] = useState(null);

  const fakeProfile = {
    age: 20,
    weight_kg: 65,
    height_cm: 175,
    activity_level: "moderate",
    goal: "muscle gain",
    health_conditions: "type 2 diabetes",
  };

  async function handleTestTargets() {
    setTargetsLoading(true);
    setTargetsError(null);
    setTargets(null);
    try {
      const result = await analyzeDailyTargets(fakeProfile);
      setTargets(result);
    } catch (err) {
      setTargetsError(err.message);
    } finally {
      setTargetsLoading(false);
    }
  }

  async function handleFileChange(e) {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setItems(null);
    setResolvedItems(null);
    setError(null);
    setLoading(true);

    try {
      const result = await analyzeFood(selectedFile);
      setItems(result.items);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto p-6 space-y-4">
      <h1 className="text-lg font-semibold text-neutral-100">Pipeline Test</h1>

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="text-sm text-neutral-300"
      />

      {loading && <p className="text-sm text-neutral-400">Analyzing photo...</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}

      {/* Step 1 result: raw AI output, useful to see what got flagged */}
      {items && (
        <div className="text-xs text-neutral-500">
          <p>Raw items from analyzeFood():</p>
          <pre className="whitespace-pre-wrap">{JSON.stringify(items, null, 2)}</pre>
        </div>
      )}

      {/* Step 2: this is where you actually TYPE your clarification answer */}
      {items && !resolvedItems && (
        <ClarificationFlow
          imageFile={file}
          initialItems={items}
          onComplete={(finalItems) => setResolvedItems(finalItems)}
        />
      )}

      {/* Step 3: final resolved data, ready to write to food_logs */}
      {resolvedItems && (
        <div className="text-sm text-green-400">
          <p className="font-medium">All resolved:</p>
          <pre className="whitespace-pre-wrap text-neutral-200">
            {JSON.stringify(resolvedItems, null, 2)}
          </pre>
        </div>
      )}

      {/* --- Separate test: daily target prediction, text-only, no photo --- */}
      <div className="border-t border-neutral-700 pt-4 space-y-2">
        <h2 className="text-sm font-semibold text-neutral-100">Daily Targets Test</h2>
        <p className="text-xs text-neutral-500">
          Testing with a hardcoded fake profile — 20yo, 65kg, 175cm, moderate activity, muscle gain goal.
        </p>
        <button
          onClick={handleTestTargets}
          disabled={targetsLoading}
          className="text-sm px-4 py-2 rounded-md bg-purple-600 text-white disabled:opacity-40"
        >
          {targetsLoading ? "Calculating..." : "Test analyzeDailyTargets()"}
        </button>
        {targetsError && <p className="text-sm text-red-400">{targetsError}</p>}
        {targets && (
          <pre className="whitespace-pre-wrap text-xs text-neutral-200">
            {JSON.stringify(targets, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}