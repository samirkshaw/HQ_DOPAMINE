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
    <div style={styles.pageWrapper}>
      {/* =========================================================
          STICKY NAVIGATION
      ========================================================= */}
      <header style={styles.navHeader}>
        <div style={styles.navContainer}>
          {/* Logo / Wordmark Left */}
          <Link to="/" style={styles.logoLink}>
            <span style={styles.logoBadge}>HQ</span>
            <span style={styles.logoText}>DOPAMINE</span>
          </Link>

          {/* Center-left Nav Links */}
          <nav style={styles.centerNav}>
            <a href="#features" style={styles.navLink}>Features</a>
            <a href="#about" style={styles.navLink}>About</a>
          </nav>

          {/* Top Right Auth Actions */}
          <div style={styles.rightNav}>
            <Link to="/auth?mode=login" style={styles.loginTextLink}>
              Log In
            </Link>
            <Link to="/auth?mode=signup" style={styles.signUpBtn}>
              Sign Up →
            </Link>
          </div>
        </div>
      </header>

      {/* =========================================================
          HERO SECTION
      ========================================================= */}
      <section style={styles.heroSection}>
        <div style={styles.heroContainer}>
          {/* Hero Left Content */}
          <div style={styles.heroTextContent}>
            <div style={styles.heroPill}>
              <span style={styles.heroPillDot}></span>
              <span>Next-Gen AI Nutrition Tracker</span>
            </div>

            <h1 style={styles.heroTitle}>
              Know exactly what's on your plate.
            </h1>

            <p style={styles.heroSubtitle}>
              Photograph any meal. AI identifies it, estimates its nutrients, and tells you honestly when it's not sure — instead of guessing.
            </p>

            <div style={styles.heroCtaGroup}>
              <button
                onClick={() => navigate('/auth?mode=signup')}
                style={styles.heroPrimaryBtn}
              >
                Get Started →
              </button>
              <a href="#features" style={styles.heroSecondaryBtn}>
                See How It Works
              </a>
            </div>

            <div style={styles.socialProofRow}>
              <div style={styles.proofAvatars}>
                <span style={{ ...styles.avatar, backgroundColor: '#FF8F6B' }}>🥗</span>
                <span style={{ ...styles.avatar, backgroundColor: '#1F9E76' }}>🍳</span>
                <span style={{ ...styles.avatar, backgroundColor: '#6B8EFF' }}>🥑</span>
              </div>
              <span style={styles.proofText}>
                <strong>No manual logging required.</strong> Powered by multimodal Gemini AI.
              </span>
            </div>
          </div>

          {/* Hero Right: Signature Visual Element (Scan & Honest Question Mockup) */}
          <div style={styles.heroVisualWrapper}>
            <div className="glass-card" style={styles.signatureCard}>
              {/* Card Header: Simulated Meal Scanner */}
              <div style={styles.mockupHeader}>
                <div style={styles.mockupHeaderLeft}>
                  <span style={styles.cameraIcon}>📸</span>
                  <div>
                    <div style={styles.mockupTitle}>Breakfast Scan</div>
                    <div style={styles.mockupTime}>Today, 8:30 AM</div>
                  </div>
                </div>
                <span style={styles.scanSuccessTag}>AI Analyzed</span>
              </div>

              {/* Photo Representation */}
              <div style={styles.photoContainer}>
                <div style={styles.photoOverlay}>
                  <div style={styles.photoTagAvocado}>🥑 Avocado Toast</div>
                  <div style={styles.photoTagEgg}>🍳 Scrambled Eggs</div>
                  <div style={styles.photoTagCoffee}>☕ Oat Latte</div>
                </div>
              </div>

              {/* Macro Progress Rings Bar */}
              <div style={styles.macroSummaryRow}>
                <div style={styles.macroItem}>
                  <span style={styles.macroVal}>520</span>
                  <span style={styles.macroLbl}>kcal</span>
                </div>
                <div style={styles.macroDivider} />
                <div style={styles.macroItem}>
                  <span style={styles.macroVal}>24g</span>
                  <span style={styles.macroLbl}>Protein</span>
                </div>
                <div style={styles.macroDivider} />
                <div style={styles.macroItem}>
                  <span style={styles.macroVal}>38g</span>
                  <span style={styles.macroLbl}>Carbs</span>
                </div>
                <div style={styles.macroDivider} />
                <div style={styles.macroItem}>
                  <span style={styles.macroVal}>22g</span>
                  <span style={styles.macroLbl}>Fat</span>
                </div>
              </div>

              {/* Signature Feature: Honest Clarifying Question Box */}
              <div style={styles.questionBox}>
                <div style={styles.questionHeader}>
                  <span style={styles.questionBadge}>? Honest AI Question</span>
                  <span style={styles.questionStatus}>
                    {isAnswered ? 'Resolved' : 'Needs clarification'}
                  </span>
                </div>
                <p style={styles.questionText}>
                  "How many eggs were used in the scramble? (Estimated 2, but portion could be 3)"
                </p>

                <div style={styles.optionButtonGroup}>
                  <button
                    onClick={() => handleSelectEggs('2 eggs')}
                    style={{
                      ...styles.optionBtn,
                      ...(selectedEggCount === '2 eggs' ? styles.optionBtnActive : {}),
                    }}
                  >
                    {selectedEggCount === '2 eggs' && '✓ '}2 Eggs (~140 kcal)
                  </button>
                  <button
                    onClick={() => handleSelectEggs('3 eggs')}
                    style={{
                      ...styles.optionBtn,
                      ...(selectedEggCount === '3 eggs' ? styles.optionBtnActive : {}),
                    }}
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
      <section id="features" style={styles.featuresSection}>
        <div style={styles.sectionHeaderContainer}>
          <span style={styles.sectionEyebrow}>Core Capabilities</span>
          <h2 style={styles.sectionTitle}>Built for real-world eating.</h2>
          <p style={styles.sectionDescription}>
            Standard macro trackers force you into tedious database searches. HQ Dopamine combines instant computer vision with honest human-in-the-loop verification.
          </p>
        </div>

        <div style={styles.featureGrid}>
          {/* Card 1 */}
          <div className="glass-card" style={styles.featureCard}>
            <div style={{ ...styles.featureIconBox, backgroundColor: 'rgba(31, 158, 118, 0.12)', color: '#1F9E76' }}>
              📷
            </div>
            <h3 style={styles.featureCardTitle}>Photograph, don't log manually</h3>
            <p style={styles.featureCardBody}>
              Snap a quick photo of your plate before eating. Advanced multimodal vision AI instantly scans ingredients, volume, and nutrient balance.
            </p>
          </div>

          {/* Card 2: YOUR REAL DIFFERENTIATOR (Highlighted) */}
          <div
            className="glass-card"
            style={{
              ...styles.featureCard,
              ...styles.featureCardDifferentiator,
            }}
          >
            <div style={styles.diffBadgeRow}>
              <div style={{ ...styles.featureIconBox, backgroundColor: 'rgba(255, 143, 107, 0.2)', color: '#FF8F6B' }}>
                🤝
              </div>
              <span style={styles.differentiatorTag}>SIGNATURE DIFFERENTIATOR</span>
            </div>
            <h3 style={styles.featureCardTitle}>Honest about uncertainty</h3>
            <p style={styles.featureCardBody}>
              Instead of giving you a confident hallucination for hidden oils or portion sizes, HQ Dopamine asks short, targeted clarifying questions when it's unsure.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-card" style={styles.featureCard}>
            <div style={{ ...styles.featureIconBox, backgroundColor: 'rgba(107, 142, 255, 0.12)', color: '#4F75FF' }}>
              🎯
            </div>
            <h3 style={styles.featureCardTitle}>Personalized daily targets</h3>
            <p style={styles.featureCardBody}>
              Get customized macro and micro recommendations based on your age, body composition, activity levels, and weight management goals.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================
          ABOUT & CTA BANNER
      ========================================================= */}
      <section id="about" style={styles.aboutSection}>
        <div className="glass-card" style={styles.ctaBanner}>
          <div style={styles.ctaBannerContent}>
            <h2 style={styles.ctaBannerTitle}>Ready for honest nutrition tracking?</h2>
            <p style={styles.ctaBannerText}>
              Stop typing in 15 individual ingredients per meal. Let AI do the heavy lifting while staying in total control.
            </p>
            <button
              onClick={() => navigate('/auth?mode=signup')}
              style={styles.ctaBannerBtn}
            >
              Get Started free →
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================
          FOOTER
      ========================================================= */}
      <footer style={styles.footer}>
        <div style={styles.footerContainer}>
          <div style={styles.footerBrand}>
            <span style={styles.logoBadge}>HQ</span>
            <span style={styles.logoText}>DOPAMINE</span>
          </div>
          <p style={styles.footerCopy}>
            © {new Date().getFullYear()} HQ Dopamine. Intelligent, honest nutrition tracking.
          </p>
        </div>
      </footer>
    </div>
  );
}

/* =========================================================
    STYLES (Light, Glassy, Mint + Emerald Aesthetic)
========================================================= */
const styles = {
  pageWrapper: {
    minHeight: '100vh',
    color: '#10241E',
    fontFamily: "var(--font-body)",
    position: 'relative',
    overflowX: 'hidden',
  },

  /* Navigation */
  navHeader: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: 'rgba(245, 248, 246, 0.8)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.7)',
  },
  navContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '16px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    textDecoration: 'none',
  },
  logoBadge: {
    backgroundColor: '#1F9E76',
    color: '#ffffff',
    fontWeight: '800',
    fontSize: '12px',
    padding: '3px 7px',
    borderRadius: '6px',
    letterSpacing: '0.5px',
  },
  logoText: {
    fontFamily: "var(--font-display)",
    fontSize: '20px',
    fontWeight: '700',
    color: '#10241E',
    letterSpacing: '-0.5px',
  },
  centerNav: {
    display: 'flex',
    gap: '32px',
    alignItems: 'center',
  },
  navLink: {
    color: '#5B6B65',
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: '500',
    transition: 'color 0.2s',
  },
  rightNav: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  loginTextLink: {
    color: '#10241E',
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: '600',
    padding: '8px 12px',
  },
  signUpBtn: {
    backgroundColor: '#1F9E76',
    color: '#ffffff',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '600',
    padding: '10px 20px',
    borderRadius: '999px',
    boxShadow: '0 4px 12px rgba(31, 158, 118, 0.25)',
    transition: 'transform 0.2s, background-color 0.2s',
  },

  /* Hero Section */
  heroSection: {
    padding: '60px 24px 80px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  heroContainer: {
    display: 'grid',
    gridTemplateColumns: '1.1fr 0.9fr',
    gap: '48px',
    alignItems: 'center',
  },
  heroTextContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  heroPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    alignSelf: 'flex-start',
    padding: '6px 14px',
    borderRadius: '999px',
    backgroundColor: 'rgba(31, 158, 118, 0.1)',
    border: '1px solid rgba(31, 158, 118, 0.2)',
    color: '#1F9E76',
    fontSize: '13px',
    fontWeight: '600',
  },
  heroPillDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#1F9E76',
  },
  heroTitle: {
    fontFamily: "var(--font-display)",
    fontSize: '56px',
    lineHeight: '1.08',
    fontWeight: '700',
    color: '#10241E',
    margin: 0,
    letterSpacing: '-1.5px',
  },
  heroSubtitle: {
    fontSize: '18px',
    lineHeight: '1.6',
    color: '#5B6B65',
    margin: 0,
    maxWidth: '520px',
  },
  heroCtaGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginTop: '8px',
  },
  heroPrimaryBtn: {
    backgroundColor: '#1F9E76',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: '600',
    padding: '14px 28px',
    borderRadius: '999px',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 6px 20px rgba(31, 158, 118, 0.3)',
    transition: 'all 0.2s',
  },
  heroSecondaryBtn: {
    color: '#10241E',
    fontSize: '15px',
    fontWeight: '600',
    textDecoration: 'none',
    padding: '14px 20px',
  },
  socialProofRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid rgba(16, 36, 30, 0.08)',
  },
  proofAvatars: {
    display: 'flex',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    border: '2px solid #ffffff',
    marginLeft: '-8px',
  },
  proofText: {
    fontSize: '13px',
    color: '#5B6B65',
  },

  /* Hero Signature Card Mockup */
  heroVisualWrapper: {
    position: 'relative',
  },
  signatureCard: {
    padding: '24px',
    border: '1px solid rgba(255, 255, 255, 0.9)',
  },
  mockupHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
  },
  mockupHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  cameraIcon: {
    fontSize: '22px',
  },
  mockupTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#10241E',
  },
  mockupTime: {
    fontSize: '12px',
    color: '#5B6B65',
  },
  scanSuccessTag: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#1F9E76',
    backgroundColor: 'rgba(31, 158, 118, 0.12)',
    padding: '4px 10px',
    borderRadius: '999px',
    letterSpacing: '0.3px',
  },
  photoContainer: {
    height: '160px',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, #E6F4ED 0%, #FFEBE3 100%)',
    position: 'relative',
    display: 'flex',
    alignItems: 'flex-end',
    padding: '12px',
    border: '1px solid rgba(255, 255, 255, 0.6)',
  },
  photoOverlay: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  photoTagAvocado: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(4px)',
    fontSize: '11px',
    fontWeight: '600',
    padding: '4px 10px',
    borderRadius: '999px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
  },
  photoTagEgg: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(4px)',
    fontSize: '11px',
    fontWeight: '600',
    padding: '4px 10px',
    borderRadius: '999px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
  },
  photoTagCoffee: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(4px)',
    fontSize: '11px',
    fontWeight: '600',
    padding: '4px 10px',
    borderRadius: '999px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
  },
  macroSummaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: '16px 0',
    padding: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: '12px',
  },
  macroItem: {
    textAlign: 'center',
  },
  macroVal: {
    fontFamily: 'var(--font-mono)',
    fontSize: '16px',
    fontWeight: '700',
    color: '#10241E',
    display: 'block',
  },
  macroLbl: {
    fontSize: '11px',
    color: '#5B6B65',
    display: 'block',
  },
  macroDivider: {
    width: '1px',
    height: '20px',
    backgroundColor: 'rgba(16, 36, 30, 0.1)',
  },
  questionBox: {
    backgroundColor: 'rgba(255, 143, 107, 0.12)',
    border: '1px solid rgba(255, 143, 107, 0.4)',
    borderRadius: '14px',
    padding: '16px',
  },
  questionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  questionBadge: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#FF8F6B',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  questionStatus: {
    fontSize: '11px',
    color: '#5B6B65',
    fontStyle: 'italic',
  },
  questionText: {
    margin: '0 0 12px 0',
    fontSize: '13px',
    fontWeight: '500',
    color: '#10241E',
    lineHeight: '1.4',
  },
  optionButtonGroup: {
    display: 'flex',
    gap: '10px',
  },
  optionBtn: {
    flex: 1,
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid rgba(16, 36, 30, 0.15)',
    backgroundColor: '#ffffff',
    color: '#10241E',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  optionBtnActive: {
    backgroundColor: '#1F9E76',
    color: '#ffffff',
    borderColor: '#1F9E76',
  },

  /* Feature Cards Section */
  featuresSection: {
    padding: '80px 24px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  sectionHeaderContainer: {
    textAlign: 'center',
    maxWidth: '640px',
    margin: '0 auto 48px',
  },
  sectionEyebrow: {
    color: '#1F9E76',
    fontSize: '12px',
    fontWeight: '700',
    letterSpacing: '2px',
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontFamily: "var(--font-display)",
    fontSize: '38px',
    color: '#10241E',
    margin: '8px 0 16px',
    lineHeight: '1.15',
  },
  sectionDescription: {
    color: '#5B6B65',
    fontSize: '16px',
    margin: 0,
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
  },
  featureCard: {
    padding: '32px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '16px',
    transition: 'transform 0.2s ease',
  },
  featureCardDifferentiator: {
    border: '2px solid rgba(255, 143, 107, 0.6)',
    boxShadow: '0 16px 36px rgba(255, 143, 107, 0.15)',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
  },
  diffBadgeRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  differentiatorTag: {
    fontSize: '10px',
    fontWeight: '800',
    color: '#FF8F6B',
    backgroundColor: 'rgba(255, 143, 107, 0.15)',
    padding: '4px 8px',
    borderRadius: '6px',
    letterSpacing: '0.8px',
  },
  featureIconBox: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
  },
  featureCardTitle: {
    fontFamily: "var(--font-display)",
    fontSize: '22px',
    fontWeight: '700',
    color: '#10241E',
    margin: 0,
  },
  featureCardBody: {
    fontSize: '14px',
    lineHeight: '1.6',
    color: '#5B6B65',
    margin: 0,
  },

  /* About Banner */
  aboutSection: {
    padding: '40px 24px 80px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  ctaBanner: {
    padding: '56px 32px',
    textAlign: 'center',
    background: 'linear-gradient(135deg, rgba(217, 242, 230, 0.7) 0%, rgba(255, 232, 221, 0.7) 100%)',
    border: '1px solid rgba(255, 255, 255, 0.9)',
  },
  ctaBannerContent: {
    maxWidth: '600px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
  },
  ctaBannerTitle: {
    fontFamily: "var(--font-display)",
    fontSize: '36px',
    color: '#10241E',
    margin: 0,
  },
  ctaBannerText: {
    fontSize: '16px',
    color: '#5B6B65',
    margin: 0,
  },
  ctaBannerBtn: {
    marginTop: '12px',
    backgroundColor: '#1F9E76',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: '600',
    padding: '14px 32px',
    borderRadius: '999px',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 6px 20px rgba(31, 158, 118, 0.3)',
  },

  /* Footer */
  footer: {
    borderTop: '1px solid rgba(16, 36, 30, 0.08)',
    padding: '32px 24px',
  },
  footerContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
  },
  footerBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  footerCopy: {
    fontSize: '13px',
    color: '#5B6B65',
    margin: 0,
  },
};
