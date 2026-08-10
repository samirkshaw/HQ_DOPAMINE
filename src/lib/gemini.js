import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error(
    "VITE_GEMINI_API_KEY is missing. Add it to your .env.local file."
  );
}

const genAI = new GoogleGenerativeAI(API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-3.6-flash",
});

/* =========================================================
   GEMINI ERROR HANDLER
   ========================================================= */

function getGeminiErrorMessage(error, fallbackMessage) {
  const message =
    error?.message ||
    error?.toString?.() ||
    "";

  const lowerMessage = message.toLowerCase();

  /*
  Gemini 429 / quota / rate limit
  */

  if (
    error?.status === 429 ||
    lowerMessage.includes("429") ||
    lowerMessage.includes("quota") ||
    lowerMessage.includes("rate limit") ||
    lowerMessage.includes("resource exhausted")
  ) {
    return (
      "Gemini is temporarily unavailable because the API quota has been reached. " +
      "Please wait a little and try again."
    );
  }

  /*
  Authentication / API key problems
  */

  if (
    error?.status === 401 ||
    error?.status === 403 ||
    lowerMessage.includes("api key") ||
    lowerMessage.includes("unauthorized") ||
    lowerMessage.includes("permission denied")
  ) {
    return (
      "Gemini API authentication failed. " +
      "Please check your VITE_GEMINI_API_KEY."
    );
  }

  /*
  Network problems
  */

  if (
    lowerMessage.includes("network") ||
    lowerMessage.includes("failed to fetch") ||
    lowerMessage.includes("fetch failed")
  ) {
    return (
      "Unable to connect to Gemini right now. " +
      "Please check your internet connection and try again."
    );
  }

  return fallbackMessage;
}

/* =========================================================
   GEMINI REQUEST HELPER
   =========================================================

   Keeps API calls consistent and prevents raw Gemini errors
   from reaching the UI.
   ========================================================= */

async function generateGeminiContent(contents) {
  try {
    const result = await model.generateContent(contents);

    if (!result?.response) {
      throw new Error("Gemini returned an empty response.");
    }

    return result.response;
  } catch (error) {
    console.error("Gemini API error:", error);

    throw new Error(
      getGeminiErrorMessage(
        error,
        "Unable to get a response from Gemini. Please try again."
      )
    );
  }
}

/* =========================================================
   Convert browser File -> Gemini inline image
   ========================================================= */

async function fileToGenerativePart(file) {
  if (!file) {
    throw new Error("No image was selected.");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Please select an image file.");
  }

  const base64EncodedData = await new Promise(
    (resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        const result = reader.result;

        if (!result || typeof result !== "string") {
          reject(
            new Error("Could not read the image.")
          );
          return;
        }

        const parts = result.split(",");

        if (parts.length < 2) {
          reject(
            new Error("Invalid image data.")
          );
          return;
        }

        resolve(parts[1]);
      };

      reader.onerror = () => {
        reject(
          new Error("Could not read the image.")
        );
      };

      reader.readAsDataURL(file);
    }
  );

  return {
    inlineData: {
      data: base64EncodedData,
      mimeType: file.type,
    },
  };
}

/* =========================================================
   Food response contract
   ========================================================= */

const RESPONSE_SHAPE_INSTRUCTIONS = `
Respond with ONLY valid JSON.

Do not use markdown.
Do not use code fences.
Do not write any explanation before or after the JSON.

Use exactly this shape:

{
  "items": [
    {
      "name": "string",
      "estimatedPortion": "string",
      "calories": number,
      "protein_g": number,
      "carbs_g": number,
      "fat_g": number,
      "fiber_g": number,
      "iron_mg": number,
      "calcium_mg": number,
      "needsClarification": boolean,
      "question": "string or null"
    }
  ]
}

Rules:

1. Identify every distinct food item that is actually visible.

2. Keep separate foods separate.

Example:
rice + dal + sabzi + roti

must become four separate items.

3. Do not invent foods, ingredients, sauces, garnishes, or drinks
   that cannot reasonably be seen.

4. Estimate the portion size from the image.

5. If the portion cannot be estimated confidently:
   "needsClarification": true

   Ask exactly ONE specific question.

6. If the portion is reasonably clear:
   "needsClarification": false
   "question": null

7. Nutrient values must always be numbers.

8. Never use null for nutrient values.

9. If a nutrient cannot be known exactly, provide a reasonable
   estimate based on the visible food and estimated portion.

10. Calories and nutrients must correspond to the estimated portion.

11. Do not create duplicate food items.

12. Do not add foods that are not visible.
`;

/* =========================================================
   Parse Gemini JSON safely
   ========================================================= */

function parseGeminiJson(rawText) {
  if (!rawText) {
    throw new Error(
      "Gemini returned an empty response."
    );
  }

  let cleaned = rawText.trim();

  cleaned = cleaned
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned);

    if (
      !parsed ||
      !Array.isArray(parsed.items)
    ) {
      throw new Error(
        "Invalid Gemini response shape."
      );
    }

    return parsed;
  } catch (error) {
    console.error(
      "Gemini returned invalid JSON:",
      rawText
    );

    throw new Error(
      "AI response could not be understood. Please try the photo again."
    );
  }
}

/* =========================================================
   Analyze food photo
   ========================================================= */

export async function analyzeFood(imageFile) {
  try {
    const imagePart =
      await fileToGenerativePart(imageFile);

    const prompt = `
${RESPONSE_SHAPE_INSTRUCTIONS}

Identify every distinct food item in this photo.

Estimate the portion of each visible food item.

Then estimate:

- calories
- protein
- carbohydrates
- fat
- fiber
- iron
- calcium

If portion information is unclear, ask one specific clarification question.
`;

    const response =
      await generateGeminiContent([
        prompt,
        imagePart,
      ]);

    const rawText = response.text();

    return parseGeminiJson(rawText);
  } catch (error) {
    console.error(
      "analyzeFood error:",
      error
    );

    throw new Error(
      error?.message ||
        "Unable to analyze the food photo. Please try again."
    );
  }
}

/* =========================================================
   Analyze again after clarification
   ========================================================= */

export async function analyzeFoodWithClarification(
  imageFile,
  clarifications,
  previousItems
) {
  try {
    const imagePart =
      await fileToGenerativePart(imageFile);

    const qaBlock = clarifications
      .map(
        (c) =>
          `- Item "${c.itemName}": question="${c.question}", user answer="${c.answer}"`
      )
      .join("\n");

    const prompt = `
${RESPONSE_SHAPE_INSTRUCTIONS}

This is the SAME food photo that was previously analyzed.

Previous result:

${JSON.stringify(previousItems, null, 2)}

The user answered these clarification questions:

${qaBlock}

Update the previous result according to the answers.

IMPORTANT:

1. Only update items that were part of the clarification.

2. Items that were NOT part of the clarification must remain
   EXACTLY unchanged.

3. Keep the same item order.

4. Keep the same number of items.

5. If the user's answer is sufficiently specific:

   - calculate the updated portion
   - calculate updated nutrient values
   - set needsClarification to false
   - set question to null

6. If the user's answer is still vague:

   - keep needsClarification true
   - ask ONE sharper question

7. Never remove an item.

8. Never add an item.

9. Return only valid JSON.
`;

    const response =
      await generateGeminiContent([
        prompt,
        imagePart,
      ]);

    const rawText = response.text();

    return parseGeminiJson(rawText);
  } catch (error) {
    console.error(
      "analyzeFoodWithClarification error:",
      error
    );

    throw new Error(
      error?.message ||
        "Unable to update the food estimate. Please try again."
    );
  }
}

/* =========================================================
   Daily targets response contract
   ========================================================= */

const TARGET_SHAPE_INSTRUCTIONS = `
Respond with ONLY valid JSON.

Do not use markdown.
Do not use code fences.
Do not write any explanation before or after the JSON.

Use exactly this shape:

{
  "calories": number,
  "protein_g": number,
  "carbs_g": number,
  "fat_g": number,
  "fiber_g": number,
  "iron_mg": number,
  "calcium_mg": number
}

All seven fields are required numbers.

Base the estimate on:

- age
- weight
- height
- activity level
- goal

Use conservative standard nutrition guidance.

Do not provide medical advice.
`;

/* =========================================================
   Analyze daily nutrition targets
   ========================================================= */

export async function analyzeDailyTargets(
  profile
) {
  try {
    const prompt = `
${TARGET_SHAPE_INSTRUCTIONS}

Calculate daily nutrition targets for:

Age: ${profile.age}

Weight: ${profile.weight_kg} kg

Height: ${profile.height_cm} cm

Activity level: ${profile.activity_level}

Goal: ${profile.goal}

Health conditions:
${profile.health_conditions || "none reported"}
`;

    const response =
      await generateGeminiContent([
        prompt,
      ]);

    const rawText = response.text();

    let cleaned = rawText
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    if (
      !parsed ||
      typeof parsed.calories !== "number" ||
      typeof parsed.protein_g !== "number" ||
      typeof parsed.carbs_g !== "number" ||
      typeof parsed.fat_g !== "number" ||
      typeof parsed.fiber_g !== "number" ||
      typeof parsed.iron_mg !== "number" ||
      typeof parsed.calcium_mg !== "number"
    ) {
      throw new Error(
        "Gemini returned invalid nutrition targets."
      );
    }

    return parsed;
  } catch (error) {
    console.error(
      "analyzeDailyTargets error:",
      error
    );

    throw new Error(
      error?.message ||
        "Unable to calculate daily nutrition targets."
    );
  }
}

/* =========================================================
   End-of-day AI guidance response contract
   ========================================================= */

const GUIDANCE_SHAPE_INSTRUCTIONS = `
Respond with ONLY valid JSON.

Do not use markdown.
Do not use code fences.
Do not write any explanation before or after the JSON.

Use exactly this shape:

{
  "guidance": "string"
}

Rules:

1. Return exactly ONE concise sentence.

2. Compare today's actual nutrition against the user's
   daily nutrition targets.

3. Mention the most important nutrient that is low,
   high, or close to target.

4. If multiple nutrients are significantly low or high,
   prioritize the most important ones and keep the sentence
   concise.

5. Do not repeat every nutrition number.

6. Do not invent foods or nutrients that are not provided.

7. Do not provide medical advice.

8. Do not diagnose health conditions.

9. Keep the tone supportive, practical, and non-judgmental.

10. If the user is close to all major targets, say that
    today's intake is broadly on track.

11. The response must be exactly one sentence.
`;

/* =========================================================
   Analyze end-of-day nutrition
   ========================================================= */

export async function analyzeEndOfDayGuidance(
  totals,
  targets
) {
  try {
    const prompt = `
${GUIDANCE_SHAPE_INSTRUCTIONS}

Today's nutrition intake:

Calories: ${totals.calories}
Protein: ${totals.protein_g} g
Carbs: ${totals.carbs_g} g
Fat: ${totals.fat_g} g
Fiber: ${totals.fiber_g} g
Iron: ${totals.iron_mg} mg
Calcium: ${totals.calcium_mg} mg

Daily nutrition targets:

Calories: ${targets.calories}
Protein: ${targets.protein_g} g
Carbs: ${targets.carbs_g} g
Fat: ${targets.fat_g} g
Fiber: ${targets.fiber_g} g
Iron: ${targets.iron_mg} mg
Calcium: ${targets.calcium_mg} mg

Generate one concise end-of-day guidance sentence
based only on these values.
`;

    const response =
      await generateGeminiContent([
        prompt,
      ]);

    const rawText = response.text();

    if (!rawText) {
      throw new Error(
        "Gemini returned an empty guidance response."
      );
    }

    let cleaned = rawText
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    if (
      !parsed ||
      typeof parsed.guidance !== "string" ||
      !parsed.guidance.trim()
    ) {
      throw new Error(
        "Gemini returned invalid guidance."
      );
    }

    return {
      guidance: parsed.guidance.trim(),
    };
  } catch (error) {
    console.error(
      "analyzeEndOfDayGuidance error:",
      error
    );

    throw new Error(
      error?.message ||
        "Unable to generate today's guidance."
    );
  }
}

/* =========================================================
   Limits
   ========================================================= */

export const MAX_CLARIFICATION_ROUNDS = 2;