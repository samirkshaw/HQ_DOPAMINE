// src/lib/gemini.js
// AI vision pipeline: photo -> identified food items + nutrient estimates
// Model: gemini-1.5-flash (vision + text)

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

/**
 * Converts a browser File object to the base64 payload Gemini's inline
 * image data expects.
 */
async function fileToGenerativePart(file) {
  const base64EncodedData = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  return {
    inlineData: {
      data: base64EncodedData,
      mimeType: file.type,
    },
  };
}

// EXTENDED contract — matches food_logs schema exactly.
// Send this version to teammate 2 today, not the calories/protein-only sample.
const RESPONSE_SHAPE_INSTRUCTIONS = `
Respond with ONLY valid JSON, no markdown fences, no prose before or after.
Use exactly this shape:

{
  "items": [
    {
      "name": "string, e.g. 'rice'",
      "estimatedPortion": "string, e.g. '1 cup' or 'unclear'",
      "calories": number,
      "protein_g": number,
      "carbs_g": number,
      "fat_g": number,
      "fiber_g": number,
      "iron_mg": number,
      "calcium_mg": number,
      "needsClarification": boolean,
      "question": "string or null — only set if needsClarification is true"
    }
  ]
}

Rules:
- One object per distinct food item visible on the plate (e.g. a thali is
  rice + dal + sabzi + roti = 4 separate items, not one "thali" item).
- If you cannot confidently estimate portion size for an item (e.g. number
  of eggs in an omelet, oil quantity in a curry), set needsClarification
  to true and ask ONE specific, answerable question in "question".
  Otherwise needsClarification is false and question is null.
- Nutrient numbers should reflect your best estimate for the portion you
  identified — never leave a field blank or as a string. If genuinely
  unknown, use your best estimate rather than 0.
- Do not include any items you cannot see. Do not hallucinate garnishes.
`;

/**
 * Analyzes a food photo and returns identified items with nutrient
 * estimates and any clarifying questions.
 *
 * @param {File} imageFile - photo from <input type="file"> or camera capture
 * @returns {Promise<{items: Array}>}
 */
export async function analyzeFood(imageFile) {
  const imagePart = await fileToGenerativePart(imageFile);

  const result = await model.generateContent([
    RESPONSE_SHAPE_INSTRUCTIONS,
    "Identify every distinct food item in this photo and estimate its nutrients.",
    imagePart,
  ]);

  const rawText = result.response.text();
  return parseGeminiJson(rawText);
}

/**
 * Follow-up call: user answered one or more clarification questions from
 * a previous analyzeFood() result. Handles ANY number of flagged items in
 * a single call — never loop this per-item, that risks drift in items
 * that were already confirmed.
 *
 * If an answer is still too vague for a confident estimate (e.g. "some
 * milk"), the returned item keeps needsClarification: true with a
 * sharper follow-up question — the UI should keep looping this function
 * until no items need clarification, capped at MAX_CLARIFICATION_ROUNDS
 * to avoid an infinite back-and-forth.
 *
 * @param {File} imageFile
 * @param {Array<{itemName: string, question: string, answer: string}>} clarifications
 * @param {Array<object>} previousItems - the full items array from the prior call
 * @returns {Promise<{items: Array}>}
 */
export async function analyzeFoodWithClarification(imageFile, clarifications, previousItems) {
  const imagePart = await fileToGenerativePart(imageFile);

  const qaBlock = clarifications
    .map(
      (c) => `- Item "${c.itemName}": you asked "${c.question}" — user answered "${c.answer}"`
    )
    .join("\n");

  const result = await model.generateContent([
    RESPONSE_SHAPE_INSTRUCTIONS,
    `This is the same photo you already analyzed. Here is your previous result:
${JSON.stringify(previousItems)}

The user has answered these clarification questions:
${qaBlock}

Rules for this update:
- Use each answer to compute an accurate nutrient value for that specific item and set its needsClarification to false — UNLESS the answer is still too vague to give a confident number (e.g. "some", "a bit", "not sure"). In that case keep needsClarification true and write a sharper, more specific follow-up question — do not silently guess.
- Every item that was NOT part of a clarification (already had needsClarification: false) must be returned completely unchanged from the previous result — same numbers, same portion. Do not re-estimate items that were already confirmed.
- Return the full items array, same length and item order as the previous result.`,
    imagePart,
  ]);

  const rawText = result.response.text();
  return parseGeminiJson(rawText);
}

export const MAX_CLARIFICATION_ROUNDS = 2;

// ---------------------------------------------------------------
// Daily target prediction — text-only, no image. Called when a user
// completes/updates their profile and hits the explicit "Recalculate"
// button (per product decision: NOT automatic on every profile edit).
// ---------------------------------------------------------------

const TARGET_SHAPE_INSTRUCTIONS = `
Respond with ONLY valid JSON, no markdown fences, no prose before or after.
Use exactly this shape — these field names match a daily_targets database
table exactly, do not rename or omit any field:

{
  "calories": number,
  "protein_g": number,
  "carbs_g": number,
  "fat_g": number,
  "fiber_g": number,
  "iron_mg": number,
  "calcium_mg": number
}

Rules:
- Base the targets on standard nutrition science for the given age, weight,
  height, activity level, and goal (weight loss / muscle gain / maintenance
  / condition management).
- If health_conditions is non-empty, factor it in conservatively (e.g.
  diabetes management should bias carbs lower and fiber higher; do not
  give medical advice beyond standard dietary guidance).
- All seven fields are required numbers — never null, never a string,
  never omitted.
`;

/**
 * Predicts daily nutrient targets from a user's profile.
 *
 * @param {object} profile - matches the profiles table shape
 * @param {number} profile.age
 * @param {number} profile.weight_kg
 * @param {number} profile.height_cm
 * @param {string} profile.health_conditions - free text, can be empty string
 * @param {string} profile.goal - "weight loss" | "muscle gain" | "maintenance" | "condition management"
 * @param {string} profile.activity_level
 * @returns {Promise<object>} matches daily_targets row shape (minus id/user_id/timestamps)
 */
export async function analyzeDailyTargets(profile) {
  const result = await model.generateContent([
    TARGET_SHAPE_INSTRUCTIONS,
    `Calculate daily nutrient targets for this person:
Age: ${profile.age}
Weight: ${profile.weight_kg} kg
Height: ${profile.height_cm} cm
Activity level: ${profile.activity_level}
Goal: ${profile.goal}
Health conditions: ${profile.health_conditions || "none reported"}`,
  ]);

  const rawText = result.response.text();
  return parseGeminiJson(rawText);
}
/**
 * Strips accidental markdown fences and parses JSON.
 * Throws a descriptive error on failure so the UI can show a retry
 * state instead of a silent blank screen — this WILL happen sometimes,
 * plan the UI for it now rather than discovering it during the demo.
 */
function parseGeminiJson(rawText) {
  const cleaned = rawText.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("Gemini returned non-JSON:", rawText);
    throw new Error("AI response could not be parsed. Retry the photo.");
  }
}