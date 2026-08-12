import { useRef, useState } from "react";
import { analyzeFood } from "../lib/gemini";
import ClarificationFlow from "./ClarificationFlow";

export default function UploadPhoto({ onFoodAnalyzed }) {
  const inputRef = useRef(null);

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [items, setItems] = useState([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleFileChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    setError("");
    setImageFile(file);

    const imageUrl = URL.createObjectURL(file);
    setPreview(imageUrl);

    setItems([]);
  }

  async function handleAnalyze() {
    if (!imageFile) {
      setError("Please select a food photo first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await analyzeFood(imageFile);
      console.log("RAW GEMINI RESULT:", JSON.stringify(result, null, 2));

      if (!result?.items || result.items.length === 0) {
        setError(
          "No food items could be identified in this photo."
        );
        return;
      }

      setItems(result.items);
    } catch (err) {
      console.error("Food analysis error:", err);

      setError(
        err?.message || "Unable to analyze the photo."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleComplete(finalItems) {
    setItems(finalItems);

    if (onFoodAnalyzed) {
      setSaving(true);
      const success = await onFoodAnalyzed(finalItems);
      setSaving(false);

      if (success) {
        handleReset();
      }
    }
  }

  async function handleUseResults() {
    if (!items.length || saving) {
      return;
    }

    if (onFoodAnalyzed) {
      setSaving(true);
      const success = await onFoodAnalyzed(items);
      setSaving(false);

      if (success) {
        handleReset();
      }
    }
  }

  function handleReset() {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setImageFile(null);
    setPreview("");
    setItems([]);
    setError("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  const needsClarification = items.some(
    (item) => item.needsClarification
  );

  return (
    <section className="ai-scanner">

      <div className="ai-upload-header">
        <div className="ai-upload-badge">
          AI FOOD SCANNER
        </div>

        <h2>Scan your food</h2>

        <p>
          Upload a photo and AI will identify the food
          and estimate its nutrition.
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      {preview && (
        <div className="ai-preview">
          <img
            src={preview}
            alt="Selected food"
          />
        </div>
      )}

      <div className="ai-upload-buttons">

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="ai-button ai-button-secondary"
        >
          {imageFile
            ? "Choose another photo"
            : "Choose food photo"}
        </button>

        {imageFile && (
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={loading}
            className="ai-button ai-button-primary"
          >
            {loading
              ? "Analyzing..."
              : "Analyze food"}
          </button>
        )}

        {imageFile && (
          <button
            type="button"
            onClick={handleReset}
            disabled={loading}
            className="ai-button ai-button-clear"
          >
            Clear
          </button>
        )}

      </div>

      {loading && (
        <div className="ai-loading">
          <div className="ai-spinner" />
          <span>
            AI is analyzing your food...
          </span>
        </div>
      )}

      {error && (
        <div className="ai-error">
          {error}
        </div>
      )}

      {items.length > 0 && (
        <div className="ai-results">

          <h3>
            AI detected {items.length} item
            {items.length === 1 ? "" : "s"}
          </h3>

          <div className="ai-food-list">

            {items.map((item, index) => (
              <div
                key={`${item.name || "food"}-${index}`}
                className="ai-food-card"
              >

                <div className="ai-food-card-top">

                  <div>
                    <strong>
                      {item.name || "Unknown food"}
                    </strong>

                    {item.estimatedPortion && (
                      <span>
                        {item.estimatedPortion}
                      </span>
                    )}
                  </div>

                  <strong>
                    {Math.round(
                      Number(item.calories) || 0
                    )}{" "}
                    kcal
                  </strong>

                </div>

                <div className="ai-nutrients">

                  <span>
                    Protein{" "}
                    {Number(item.protein_g || 0)}g
                  </span>

                  <span>
                    Carbs{" "}
                    {Number(item.carbs_g || 0)}g
                  </span>

                  <span>
                    Fat{" "}
                    {Number(item.fat_g || 0)}g
                  </span>

                  <span>
                    Fiber{" "}
                    {Number(item.fiber_g || 0)}g
                  </span>

                  <span>
                    Iron{" "}
                    {Number(item.iron_mg || 0)}mg
                  </span>

                  <span>
                    Calcium{" "}
                    {Number(item.calcium_mg || 0)}mg
                  </span>

                </div>

              </div>
            ))}

          </div>

          {needsClarification ? (
            <ClarificationFlow
              imageFile={imageFile}
              initialItems={items}
              onComplete={handleComplete}
            />
          ) : (
            <button
              type="button"
              onClick={handleUseResults}
              disabled={saving}
              className="ai-save-results"
            >
              {saving ? "Saving..." : "Save these nutrition values"}
            </button>
          )}

        </div>
      )}

      <style>{`
        .ai-scanner {
          width: 100%;
          box-sizing: border-box;
          padding: 28px;
          margin-bottom: 24px;
          border: 1px solid rgba(255, 255, 255, 0.9);
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.65);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow: 0 12px 32px rgba(16, 36, 30, 0.06);
        }

        .ai-upload-badge {
          display: inline-block;
          margin-bottom: 9px;
          padding: 5px 12px;
          border: 1px solid rgba(31, 158, 118, 0.25);
          border-radius: 999px;
          color: #1F9E76;
          background: rgba(31, 158, 118, 0.1);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
        }

        .ai-upload-header h2 {
          margin: 0;
          color: #10241E;
          font-family: var(--font-display);
          font-size: 24px;
          font-weight: 700;
        }

        .ai-upload-header p {
          margin: 6px 0 20px;
          color: #5B6B65;
          font-size: 14px;
          line-height: 1.5;
        }

        .ai-upload-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .ai-button {
          min-height: 42px;
          padding: 0 20px;
          border-radius: 999px;
          font-family: inherit;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .ai-button-secondary {
          border: 1px solid rgba(31, 158, 118, 0.3);
          background: rgba(31, 158, 118, 0.08);
          color: #1F9E76;
        }

        .ai-button-primary {
          border: none;
          background: #1F9E76;
          color: white;
          box-shadow: 0 4px 14px rgba(31, 158, 118, 0.25);
        }

        .ai-button-clear {
          border: 1px solid rgba(16, 36, 30, 0.12);
          background: rgba(255, 255, 255, 0.8);
          color: #5B6B65;
        }

        .ai-button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .ai-preview {
          width: 100%;
          margin-bottom: 16px;
          overflow: hidden;
          border-radius: 14px;
          border: 1px solid rgba(16, 36, 30, 0.12);
        }

        .ai-preview img {
          display: block;
          width: 100%;
          max-height: 340px;
          object-fit: cover;
        }

        .ai-loading {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 16px;
          color: #1F9E76;
          font-size: 13px;
          font-weight: 600;
        }

        .ai-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(31, 158, 118, 0.2);
          border-top-color: #1F9E76;
          border-radius: 50%;
          animation: ai-spin 0.8s linear infinite;
        }

        @keyframes ai-spin {
          to {
            transform: rotate(360deg);
          }
        }

        .ai-error {
          margin-top: 16px;
          padding: 12px;
          border: 1px solid rgba(239, 68, 68, 0.25);
          border-radius: 10px;
          background: rgba(239, 68, 68, 0.1);
          color: #dc2626;
          font-size: 13px;
        }

        .ai-results {
          margin-top: 24px;
        }

        .ai-results h3 {
          margin: 0 0 14px;
          color: #10241E;
          font-family: var(--font-display);
          font-size: 18px;
        }

        .ai-food-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .ai-food-card {
          padding: 16px;
          border: 1px solid rgba(16, 36, 30, 0.08);
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.75);
        }

        .ai-food-card-top {
          display: flex;
          justify-content: space-between;
          gap: 12px;
        }

        .ai-food-card-top > div {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .ai-food-card-top strong {
          color: #10241E;
          font-size: 15px;
        }

        .ai-food-card-top span {
          color: #5B6B65;
          font-size: 12px;
        }

        .ai-food-card-top > strong:last-child {
          flex-shrink: 0;
          color: #FF8F6B;
          font-family: var(--font-mono);
          font-size: 15px;
        }

        .ai-nutrients {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-top: 12px;
        }

        .ai-nutrients span {
          padding: 8px 10px;
          border-radius: 8px;
          background: rgba(16, 36, 30, 0.04);
          color: #10241E;
          font-family: var(--font-mono);
          font-size: 12px;
        }

        .ai-save-results {
          width: 100%;
          height: 46px;
          margin-top: 16px;
          border: none;
          border-radius: 999px;
          background: #1F9E76;
          color: white;
          font-family: inherit;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(31, 158, 118, 0.25);
        }

        @media (max-width: 500px) {
          .ai-scanner {
            padding: 20px;
          }

          .ai-nutrients {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </section>
  );
}