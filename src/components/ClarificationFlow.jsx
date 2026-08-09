// src/components/ClarificationFlow.jsx
// Second half of the core loop: shows clarification questions for
// flagged items, collects answers or "estimate for me," and resolves
// them via analyzeFoodWithClarification.

import { useState, useEffect } from "react";
import { analyzeFoodWithClarification, MAX_CLARIFICATION_ROUNDS } from "../lib/gemini";

/**
 * @param {File} imageFile - the original photo, needed for every follow-up call
 * @param {Array} initialItems - the items array from analyzeFood()
 * @param {(finalItems: Array) => void} onComplete - called once every item
 *   is resolved (either confirmed, answered, or estimated)
 */
export default function ClarificationFlow({ imageFile, initialItems, onComplete }) {
  const [items, setItems] = useState(initialItems);
  const [draftAnswers, setDraftAnswers] = useState({}); // itemName -> typed text
  const [round, setRound] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const flaggedItems = items.filter((i) => i.needsClarification);

  // "Estimate for me" — don't call the API again. The model already gave
  // a best-guess portion/nutrient set when it flagged the item; accepting
  // that guess as final is exactly the honest-about-precision behavior
  // the product is built around. Mark it estimated, not confirmed.
  function handleEstimateForMe(itemName) {
    setItems((prev) =>
      prev.map((item) =>
        item.name === itemName
          ? { ...item, needsClarification: false, is_estimated: true }
          : item
      )
    );
  }

  function handleDraftChange(itemName, text) {
    setDraftAnswers((prev) => ({ ...prev, [itemName]: text }));
  }

  async function handleSubmitAnswers() {
    const clarifications = Object.entries(draftAnswers)
      .filter(([, answer]) => answer.trim().length > 0)
      .map(([itemName, answer]) => {
        const item = items.find((i) => i.name === itemName);
        return { itemName, question: item.question, answer };
      });

    if (clarifications.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const result = await analyzeFoodWithClarification(imageFile, clarifications, items);
      const nextRound = round + 1;
      setRound(nextRound);

      // Force-resolve anything still flagged once we hit the round cap —
      // don't let a vague answer loop the UI forever.
      const finalized = result.items.map((item) =>
        item.needsClarification && nextRound >= MAX_CLARIFICATION_ROUNDS
          ? { ...item, needsClarification: false, is_estimated: true }
          : { ...item, is_estimated: item.is_estimated ?? false }
      );

      setItems(finalized);
      setDraftAnswers({});

      const stillFlagged = finalized.some((i) => i.needsClarification);
      if (!stillFlagged) onComplete(finalized);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Nothing left to ask — hand off immediately (covers the estimate-for-me-only path)
  if (flaggedItems.length === 0) {
    const allResolved = items.every((i) => !i.needsClarification);
    if (allResolved) onComplete(items);
    return null;
  }

  return (
    <div className="space-y-4 p-4 rounded-lg border border-neutral-700 bg-neutral-900">
      <h3 className="text-sm font-medium text-neutral-300">
        A few things I couldn't tell from the photo ({flaggedItems.length}
        {round > 0 ? ` — round ${round + 1} of ${MAX_CLARIFICATION_ROUNDS}` : ""})
      </h3>

      {flaggedItems.map((item) => (
        <div key={item.name} className="space-y-1.5">
          <p className="text-sm text-neutral-200">
            <span className="font-medium">{item.name}:</span> {item.question}
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={draftAnswers[item.name] || ""}
              onChange={(e) => handleDraftChange(item.name, e.target.value)}
              placeholder="Type your answer..."
              className="flex-1 rounded-md bg-neutral-800 border border-neutral-600 px-3 py-1.5 text-sm text-neutral-100"
            />
            <button
              onClick={() => handleEstimateForMe(item.name)}
              className="text-xs px-3 py-1.5 rounded-md border border-neutral-600 text-neutral-300 hover:bg-neutral-800"
            >
              Not sure / Estimate for me
            </button>
          </div>
        </div>
      ))}

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        onClick={handleSubmitAnswers}
        disabled={loading || Object.values(draftAnswers).every((v) => !v?.trim())}
        className="text-sm px-4 py-2 rounded-md bg-blue-600 text-white disabled:opacity-40"
      >
        {loading ? "Updating..." : "Submit answers"}
      </button>
    </div>
  );
}