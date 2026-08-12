# HonestBite AI

**Nutrition, honestly tracked.**

HonestBite AI is an AI-powered nutrition tracker that identifies your meals from a single photo — and instead of confidently guessing when it's unsure, it asks. Most calorie-tracking apps hallucinate a number for every meal regardless of how ambiguous the photo is. HonestBite AI flags genuine uncertainty and asks one sharp clarification question instead, then logs accurate, personalized nutrition data against AI-generated daily targets.

Built for **VibeForge Hackathon** (Adamas University).

---

## Live Demo

🔗 [hq-dopamine.vercel.app](https://hq-dopamine.vercel.app)

---

## The Problem

Standard nutrition trackers force you into tedious manual database searches, or they use AI that confidently estimates portions it genuinely cannot see clearly — producing plausible-looking but inaccurate numbers. Neither approach is honest about what the AI actually knows.

## Our Approach

1. **Photograph your meal** — no manual search, no barcode scanning.
2. **AI identifies each distinct food item** and estimates its portion and full nutrient profile (calories, protein, carbs, fat, fiber, iron, calcium).
3. **When a portion genuinely can't be determined from the photo** (a bowl of curry with no size reference, for example), the AI asks one specific clarification question instead of guessing.
4. **Personalized daily targets** are auto-generated from your profile (age, weight, height, activity level, goal) and every meal is logged against them.
5. **Track consistency over time** with a calendar view showing on-track, off-target, and missed days.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite, Tailwind CSS v4 |
| Backend / Database | Supabase (PostgreSQL, Auth, Row-Level Security) |
| AI | Google Gemini API (multimodal vision + text) |
| Deployment | Vercel |

---

## Core Features

- **AI food scanning** — photo-to-nutrition pipeline using Gemini's multimodal vision
- **Honest clarification flow** — the AI asks targeted questions instead of guessing when a portion is ambiguous, up to a bounded number of clarification rounds
- **Manual food logging** — for meals you'd rather enter by hand
- **Auto-generated daily nutrition targets** — calculated from your profile on first save
- **Dashboard** — today's intake vs. targets, meal-grouped food log
- **History & calendar** — monthly view of on-track / off-target / missed days, plus weekly and monthly consistency stats
- **Secure, per-user data** — Supabase Auth with Row-Level Security scoping every record to its owner

---

## Getting Started

### Prerequisites
- Node.js 18+
- A Supabase project (with `profiles`, `food_logs`, and `daily_targets` tables set up)
- A Gemini API key

### Setup

```bash
git clone https://github.com/samirkshaw/HQ_DOPAMINE.git
cd HQ_DOPAMINE
npm install
```

Create a `.env.local` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

Run the dev server:

```bash
npm run dev
```

---

## Project Structure

```
src/
├── components/       # Reusable UI (Navbar, UploadPhoto, ClarificationFlow, MealLogCard, NutritionCalendar, Dashboard)
├── context/          # AuthContext (Supabase session management)
├── lib/              # Supabase client, Gemini API integration, shared food-log utilities
├── pages/            # Route-level pages (Landing, Auth, Profile, Log, History)
└── App.jsx           # Routing and protected-route logic
```

---

## Team

| Name | Role |
|---|---|
| **Samir Kumar Shaw** | AI & UI |
| **Samiksha Singh** | Frontend, Backend & Authentication |
| **Anant Shaw** | Presenter & Researcher |

---

## Acknowledgments

Built for VibeForge Hackathon, Adamas University. Powered by Google Gemini and Supabase.
