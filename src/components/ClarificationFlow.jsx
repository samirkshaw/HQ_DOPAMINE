// src/components/ClarificationFlow.jsx

import { useState } from "react";

import {
  analyzeFoodWithClarification,
  MAX_CLARIFICATION_ROUNDS,
} from "../lib/gemini";

export default function ClarificationFlow({
  imageFile,
  initialItems,
  onComplete,
}) {
  const [items, setItems] = useState(initialItems || []);
  const [draftAnswers, setDraftAnswers] = useState({});
  const [round, setRound] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /*
   * Only items that still need clarification are shown.
   */
  const flaggedItems = items.filter(
    (item) => item.needsClarification
  );

  /*
   * Update the answer for a specific food item.
   */
  function handleDraftChange(itemName, value) {
    setDraftAnswers((previous) => ({
      ...previous,
      [itemName]: value,
    }));
  }

  /*
   * Let the user accept an automatic estimate.
   *
   * IMPORTANT:
   * If this was the final item requiring clarification,
   * immediately send the finalized items back to UploadPhoto.
   */
  function handleEstimateForMe(itemName) {
    const updatedItems = items.map((item) =>
      item.name === itemName
        ? {
            ...item,
            needsClarification: false,
            question: null,
            is_estimated: true,
          }
        : item
    );

    setItems(updatedItems);

    const stillNeedsClarification = updatedItems.some(
      (item) => item.needsClarification
    );

    if (!stillNeedsClarification) {
      onComplete?.(updatedItems);
    }
  }

  /*
   * Submit the user's answers to Gemini.
   */
  async function handleSubmitAnswers() {
    const clarifications = Object.entries(draftAnswers)
      .filter(
        ([, answer]) =>
          answer && answer.trim().length > 0
      )
      .map(([itemName, answer]) => {
        const item = items.find(
          (current) => current.name === itemName
        );

        return {
          itemName,
          question: item?.question || "",
          answer: answer.trim(),
        };
      });

    /*
     * Don't call Gemini if the user hasn't answered
     * any clarification questions.
     */
    if (clarifications.length === 0) {
      setError(
        "Please answer at least one clarification question."
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result =
        await analyzeFoodWithClarification(
          imageFile,
          clarifications,
          items
        );

      /*
       * Make sure Gemini returned the expected structure.
       */
      if (
        !result ||
        !Array.isArray(result.items) ||
        result.items.length === 0
      ) {
        throw new Error(
          "The AI returned an invalid food estimate."
        );
      }

      const nextRound = round + 1;

      setRound(nextRound);

      /*
       * After the maximum number of clarification rounds,
       * anything still uncertain becomes an estimate.
       */
      const finalizedItems = result.items.map(
        (item) => {
          if (
            item.needsClarification &&
            nextRound >= MAX_CLARIFICATION_ROUNDS
          ) {
            return {
              ...item,
              needsClarification: false,
              question: null,
              is_estimated: true,
            };
          }

          return {
            ...item,
            is_estimated:
              item.is_estimated ?? false,
          };
        }
      );

      setItems(finalizedItems);
      setDraftAnswers({});

      /*
       * Check whether anything still needs clarification.
       */
      const stillNeedsClarification =
        finalizedItems.some(
          (item) => item.needsClarification
        );

      /*
       * Everything is now finalized.
       * Send the final nutrition values back to UploadPhoto.
       */
      if (!stillNeedsClarification) {
        onComplete?.(finalizedItems);
      }
    } catch (error) {
      console.error(
        "ClarificationFlow error:",
        error
      );

      setError(
        error?.message ||
          "Unable to update the food estimates. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * If there are no foods requiring clarification,
   * there is nothing for this component to render.
   */
  if (flaggedItems.length === 0) {
    return null;
  }

  /*
   * Check whether at least one answer has been entered.
   */
  const hasAnswer = Object.values(
    draftAnswers
  ).some(
    (value) =>
      typeof value === "string" &&
      value.trim().length > 0
  );

  return (
    <div className="clarification-flow">
      <div className="clarification-header">
        <h3>
          A few things I couldn't tell from the photo
        </h3>

        <p>
          {flaggedItems.length} item
          {flaggedItems.length === 1 ? "" : "s"} need
          {flaggedItems.length === 1 ? "s" : ""} clarification.
        </p>

        {round > 0 && (
          <p>
            Round {round + 1} of{" "}
            {MAX_CLARIFICATION_ROUNDS}
          </p>
        )}
      </div>

      <div className="clarification-items">
        {flaggedItems.map((item, index) => (
          <div
            key={`${item.name}-${index}`}
            className="clarification-item"
          >
            <div className="clarification-question">
              <strong>{item.name}</strong>

              <span>
                {item.question ||
                  "What was the approximate portion size?"}
              </span>
            </div>

            <div className="clarification-actions">
              <input
                type="text"
                value={
                  draftAnswers[item.name] || ""
                }
                onChange={(event) =>
                  handleDraftChange(
                    item.name,
                    event.target.value
                  )
                }
                placeholder="Type your answer..."
                disabled={loading}
              />

              <button
                type="button"
                onClick={() =>
                  handleEstimateForMe(item.name)
                }
                disabled={loading}
              >
                Estimate for me
              </button>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="clarification-error">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmitAnswers}
        disabled={loading || !hasAnswer}
        className="clarification-submit"
      >
        {loading
          ? "Updating..."
          : "Submit answers"}
      </button>
    </div>
  );
}