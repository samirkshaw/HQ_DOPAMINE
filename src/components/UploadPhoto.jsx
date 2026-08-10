import { useRef, useState } from "react";
import { analyzeFood } from "../lib/gemini";
import ClarificationFlow from "./ClarificationFlow";

export default function UploadPhoto({ onFoodAnalyzed }) {
  const inputRef = useRef(null);

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [items, setItems] = useState([]);

  const [loading, setLoading] = useState(false);
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

  function handleComplete(finalItems) {
    setItems(finalItems);

    if (onFoodAnalyzed) {
      onFoodAnalyzed(finalItems);
    }
  }

  function handleUseResults() {
    if (!items.length) {
      return;
    }

    if (onFoodAnalyzed) {
      onFoodAnalyzed(items);
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
              className="ai-save-results"
            >
              Save these nutrition values
            </button>
          )}

        </div>
      )}

      <style>{`
        .ai-scanner {
          width: 100%;
          box-sizing: border-box;
          padding: 22px;
          margin-bottom: 18px;
          border: 1px solid rgba(139, 92, 246, 0.18);
          border-radius: 17px;
          background:
            radial-gradient(
              circle at 0% 0%,
              rgba(139, 92, 246, 0.09),
              transparent 45%
            ),
            rgba(18, 18, 24, 0.88);
          box-shadow:
            0 20px 50px rgba(0, 0, 0, 0.22),
            inset 0 1px 0 rgba(255, 255, 255, 0.025);
        }

        .ai-upload-badge {
          display: inline-block;
          margin-bottom: 9px;
          padding: 5px 9px;
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 999px;
          color: #c4b5fd;
          background: rgba(139, 92, 246, 0.08);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .ai-upload-header h2 {
          margin: 0;
          color: #ffffff;
          font-size: 19px;
          font-weight: 800;
        }

        .ai-upload-header p {
          margin: 7px 0 16px;
          color: #8d8da1;
          font-size: 12px;
          line-height: 1.5;
        }

        .ai-upload-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 9px;
        }

        .ai-button {
          min-height: 36px;
          padding: 0 13px;
          border-radius: 9px;
          font-family: inherit;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .ai-button-secondary {
          border: 1px solid #8b5cf6;
          background: transparent;
          color: #c4b5fd;
        }

        .ai-button-primary {
          border: none;
          background: #8b5cf6;
          color: white;
        }

        .ai-button-clear {
          border: 1px solid #292932;
          background: #111116;
          color: #aaaabc;
        }

        .ai-button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .ai-preview {
          width: 100%;
          margin-bottom: 14px;
          overflow: hidden;
          border-radius: 12px;
          border: 1px solid #292932;
        }

        .ai-preview img {
          display: block;
          width: 100%;
          max-height: 320px;
          object-fit: cover;
        }

        .ai-loading {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 15px;
          color: #a78bfa;
          font-size: 12px;
        }

        .ai-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(139, 92, 246, 0.2);
          border-top-color: #8b5cf6;
          border-radius: 50%;
          animation: ai-spin 0.8s linear infinite;
        }

        @keyframes ai-spin {
          to {
            transform: rotate(360deg);
          }
        }

        .ai-error {
          margin-top: 14px;
          padding: 10px 12px;
          border: 1px solid rgba(248, 113, 113, 0.18);
          border-radius: 9px;
          background: rgba(248, 113, 113, 0.08);
          color: #fca5a5;
          font-size: 12px;
        }

        .ai-results {
          margin-top: 20px;
        }

        .ai-results h3 {
          margin: 0 0 10px;
          color: #ffffff;
          font-size: 15px;
        }

        .ai-food-list {
          display: flex;
          flex-direction: column;
          gap: 9px;
        }

        .ai-food-card {
          padding: 13px;
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 11px;
          background: rgba(10, 10, 15, 0.65);
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
          color: #ffffff;
          font-size: 13px;
        }

        .ai-food-card-top span {
          color: #666676;
          font-size: 10px;
        }

        .ai-food-card-top > strong:last-child {
          flex-shrink: 0;
          color: #a78bfa;
        }

        .ai-nutrients {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px;
          margin-top: 11px;
        }

        .ai-nutrients span {
          padding: 7px;
          border-radius: 7px;
          background: rgba(255, 255, 255, 0.025);
          color: #aaaabc;
          font-size: 10px;
        }

        .ai-save-results {
          width: 100%;
          height: 40px;
          margin-top: 13px;
          border: none;
          border-radius: 9px;
          background: linear-gradient(
            90deg,
            #8b5cf6,
            #9257f5
          );
          color: white;
          font-family: inherit;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
        }

        @media (max-width: 500px) {
          .ai-scanner {
            padding: 18px;
          }

          .ai-nutrients {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </section>
  );
}