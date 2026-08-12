import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();
  const [selectedEggCount, setSelectedEggCount] = useState('2 eggs');
  const [isAnswered, setIsAnswered] = useState(false);

  const handleSelectEggs = (count) => {
    setSelectedEggCount(count);
    setIsAnswered(true);
  };

  return (
    <div className="min-h-screen text-[#10241E] font-body relative overflow-x-hidden">
      {/* =========================================================
          STICKY NAVIGATION
      ========================================================= */}
      <header className="sticky top-0 z-50 bg-[#F5F8F6]/80 backdrop-blur-md border-b border-white/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo Left */}
          <Link to="/" className="flex items-center text-decoration-none group" title="HonestBite AI Home">
            <img 
              src="/logo-full.svg" 
              alt="HonestBite AI" 
              className="h-8 sm:h-9 w-auto object-contain group-hover:scale-[1.02] transition-transform duration-200" 
            />
          </Link>

          {/* Center Nav Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-[#5B6B65] hover:text-[#10241E] text-sm font-medium transition-colors">Features</a>
            <a href="#about" className="text-[#5B6B65] hover:text-[#10241E] text-sm font-medium transition-colors">About</a>
          </nav>

          {/* Top Right Auth Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/auth?mode=login" className="text-[#10241E] hover:text-[#1F9E76] text-sm font-semibold px-3 py-1.5 transition-colors">
              Log In
            </Link>
            <Link to="/auth?mode=signup" className="bg-[#1F9E76] hover:bg-[#178361] text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-full shadow-md transition-all">
              Sign Up →
            </Link>
          </div>
        </div>
      </header>

      {/* =========================================================
          HERO SECTION
      ========================================================= */}
      <section className="px-4 py-8 sm:px-6 sm:py-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Hero Left Content */}
          <div className="flex flex-col gap-5">
            <div className="inline-flex items-center gap-2 self-start px-3.5 py-1.5 rounded-full bg-[#1F9E76]/10 border border-[#1F9E76]/20 text-[#1F9E76] text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1F9E76]" />
              <span>Next-Gen AI Nutrition Tracker</span>
            </div>

            <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold text-[#10241E] leading-[1.08] tracking-tight">
              Know exactly what's on your plate.
            </h1>

            <p className="text-[#5B6B65] text-base sm:text-lg leading-relaxed max-w-xl">
              Photograph any meal. AI identifies it, estimates its nutrients, and tells you honestly when it's not sure — instead of guessing.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mt-2">
              <button
                onClick={() => navigate('/auth?mode=signup')}
                className="bg-[#1F9E76] hover:bg-[#178361] text-white font-semibold text-base py-3.5 px-7 rounded-full shadow-lg transition-all cursor-pointer text-center"
              >
                Get Started →
              </button>
              <a
                href="#features"
                className="text-[#10241E] hover:text-[#1F9E76] font-semibold text-base py-3.5 px-5 text-center transition-colors"
              >
                See How It Works
              </a>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-[#10241E]/8 mt-3">
              <div className="flex -space-x-2">
                <span className="w-8 h-8 rounded-full bg-[#FF8F6B] border-2 border-white flex items-center justify-center text-sm">🥗</span>
                <span className="w-8 h-8 rounded-full bg-[#1F9E76] border-2 border-white flex items-center justify-center text-sm">🍳</span>
                <span className="w-8 h-8 rounded-full bg-[#6B8EFF] border-2 border-white flex items-center justify-center text-sm">🥑</span>
              </div>
              <span className="text-xs sm:text-sm text-[#5B6B65]">
                <strong className="text-[#10241E]">No manual logging required.</strong> Powered by multimodal Gemini AI.
              </span>
            </div>
          </div>

          {/* Hero Right: Signature Visual Element (Scan & Honest Question Mockup) */}
          <div className="w-full">
            <div className="glass-card p-4 sm:p-6 rounded-2xl border border-white/90">
              {/* Card Header: Simulated Meal Scanner */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-xl">📸</span>
                  <div>
                    <div className="text-sm font-bold text-[#10241E]">Breakfast Scan</div>
                    <div className="text-xs text-[#5B6B65]">Today, 8:30 AM</div>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-[#1F9E76] bg-[#1F9E76]/12 px-2.5 py-1 rounded-full tracking-wider">
                  AI Analyzed
                </span>
              </div>

              {/* Photo Representation */}
              <div className="h-36 sm:h-40 rounded-xl bg-gradient-to-br from-[#E6F4ED] to-[#FFEBE3] p-3 flex items-end border border-white/60 relative mb-4">
                <div className="flex flex-wrap gap-2">
                  <span className="bg-white/85 backdrop-blur-xs text-xs font-semibold px-2.5 py-1 rounded-full shadow-xs">🥑 Avocado Toast</span>
                  <span className="bg-white/85 backdrop-blur-xs text-xs font-semibold px-2.5 py-1 rounded-full shadow-xs">🍳 Scrambled Eggs</span>
                  <span className="bg-white/85 backdrop-blur-xs text-xs font-semibold px-2.5 py-1 rounded-full shadow-xs">☕ Oat Latte</span>
                </div>
              </div>

              {/* Macro Summary Row */}
              <div className="grid grid-cols-4 gap-2 text-center p-3 bg-white/50 rounded-xl mb-4">
                <div>
                  <span className="font-mono text-sm sm:text-base font-bold text-[#10241E] block">520</span>
                  <span className="text-[11px] text-[#5B6B65] block">kcal</span>
                </div>
                <div className="border-l border-[#10241E]/10 pl-2">
                  <span className="font-mono text-sm sm:text-base font-bold text-[#10241E] block">24g</span>
                  <span className="text-[11px] text-[#5B6B65] block">Protein</span>
                </div>
                <div className="border-l border-[#10241E]/10 pl-2">
                  <span className="font-mono text-sm sm:text-base font-bold text-[#10241E] block">38g</span>
                  <span className="text-[11px] text-[#5B6B65] block">Carbs</span>
                </div>
                <div className="border-l border-[#10241E]/10 pl-2">
                  <span className="font-mono text-sm sm:text-base font-bold text-[#10241E] block">22g</span>
                  <span className="text-[11px] text-[#5B6B65] block">Fat</span>
                </div>
              </div>

              {/* Signature Feature: Honest Clarifying Question Box */}
              <div className="bg-[#FF8F6B]/12 border border-[#FF8F6B]/40 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-[#FF8F6B] uppercase tracking-wider">? Honest AI Question</span>
                  <span className="text-[11px] text-[#5B6B65] italic">
                    {isAnswered ? 'Resolved' : 'Needs clarification'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-[#10241E] leading-snug mb-3">
                  "How many eggs were used in the scramble? (Estimated 2, but portion could be 3)"
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() => handleSelectEggs('2 eggs')}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                      selectedEggCount === '2 eggs'
                        ? "bg-[#1F9E76] text-white border-[#1F9E76]"
                        : "bg-white text-[#10241E] border-[#10241E]/15 hover:bg-black/5"
                    }`}
                  >
                    {selectedEggCount === '2 eggs' && '✓ '}2 Eggs (~140 kcal)
                  </button>
                  <button
                    onClick={() => handleSelectEggs('3 eggs')}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                      selectedEggCount === '3 eggs'
                        ? "bg-[#1F9E76] text-white border-[#1F9E76]"
                        : "bg-white text-[#10241E] border-[#10241E]/15 hover:bg-black/5"
                    }`}
                  >
                    {selectedEggCount === '3 eggs' && '✓ '}3 Eggs (~210 kcal)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          THREE FEATURE CARDS
      ========================================================= */}
      <section id="features" className="px-4 py-12 sm:px-6 sm:py-20 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <span className="text-[#1F9E76] text-xs font-bold tracking-widest uppercase">Core Capabilities</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#10241E] mt-2 mb-4 leading-tight">
            Built for real-world eating.
          </h2>
          <p className="text-[#5B6B65] text-sm sm:text-base leading-relaxed">
            Standard macro trackers force you into tedious database searches. HonestBite AI combines instant computer vision with honest human-in-the-loop verification.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="glass-card p-6 sm:p-8 rounded-2xl flex flex-col gap-4">
            <div className="w-11 h-11 rounded-xl bg-[#1F9E76]/12 text-[#1F9E76] flex items-center justify-center text-xl">
              📷
            </div>
            <h3 className="font-display text-xl font-bold text-[#10241E]">Photograph, don't log manually</h3>
            <p className="text-xs sm:text-sm text-[#5B6B65] leading-relaxed">
              Snap a quick photo of your plate before eating. Advanced multimodal vision AI instantly scans ingredients, volume, and nutrient balance.
            </p>
          </div>

          {/* Card 2: YOUR REAL DIFFERENTIATOR (Highlighted) */}
          <div className="glass-card p-6 sm:p-8 rounded-2xl flex flex-col gap-4 border-2 border-[#FF8F6B]/60 shadow-lg bg-white/75">
            <div className="flex items-center justify-between w-full">
              <div className="w-11 h-11 rounded-xl bg-[#FF8F6B]/20 text-[#FF8F6B] flex items-center justify-center text-xl">
                🤝
              </div>
              <span className="text-[10px] font-extrabold text-[#FF8F6B] bg-[#FF8F6B]/15 px-2.5 py-1 rounded-md tracking-wider">
                SIGNATURE DIFFERENTIATOR
              </span>
            </div>
            <h3 className="font-display text-xl font-bold text-[#10241E]">Honest about uncertainty</h3>
            <p className="text-xs sm:text-sm text-[#5B6B65] leading-relaxed">
              Instead of giving you a confident hallucination for hidden oils or portion sizes, HonestBite AI asks short, targeted clarifying questions when it's unsure.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-card p-6 sm:p-8 rounded-2xl flex flex-col gap-4">
            <div className="w-11 h-11 rounded-xl bg-[#6B8EFF]/12 text-[#4F75FF] flex items-center justify-center text-xl">
              🎯
            </div>
            <h3 className="font-display text-xl font-bold text-[#10241E]">Personalized daily targets</h3>
            <p className="text-xs sm:text-sm text-[#5B6B65] leading-relaxed">
              Get customized macro and micro recommendations based on your age, body composition, activity levels, and weight management goals.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================
          ABOUT & CTA BANNER
      ========================================================= */}
      <section id="about" className="px-4 py-8 sm:px-6 sm:py-16 max-w-7xl mx-auto">
        <div className="glass-card p-8 sm:p-14 text-center bg-gradient-to-br from-[#D9F2E6]/70 to-[#FFE8DD]/70 rounded-3xl border border-white/90">
          <div className="max-w-xl mx-auto flex flex-col items-center gap-4">
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-[#10241E]">
              Ready for honest nutrition tracking?
            </h2>
            <p className="text-sm sm:text-base text-[#5B6B65] leading-relaxed">
              Stop typing in 15 individual ingredients per meal. Let AI do the heavy lifting while staying in total control.
            </p>
            <button
              onClick={() => navigate('/auth?mode=signup')}
              className="mt-3 bg-[#1F9E76] hover:bg-[#178361] text-white text-base font-semibold py-3.5 px-8 rounded-full shadow-lg transition-all cursor-pointer"
            >
              Get Started free →
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================
          FOOTER
      ========================================================= */}
      <footer className="border-t border-[#10241E]/8 py-8 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center">
            <img 
              src="/logo-full.svg" 
              alt="HonestBite AI" 
              className="h-7 w-auto object-contain opacity-90" 
            />
          </div>
          <p className="text-xs sm:text-sm text-[#5B6B65]">
            © {new Date().getFullYear()} HonestBite AI. Intelligent, honest nutrition tracking.
          </p>
        </div>
      </footer>
    </div>
  );
}

