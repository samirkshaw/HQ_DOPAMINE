import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import NutritionCalendar from '../components/NutritionCalendar';

export default function History() {
  const { user } = useAuth();

  const [foodLogs, setFoodLogs] = useState([]);
  const [targets, setTargets] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    loadHistoryData();
  }, [user]);

  async function loadHistoryData() {
    setLoading(true);
    setError('');

    try {
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth();

      // First day of current month (YYYY-MM-01)
      const firstDayStr = `${year}-${String(month + 1).padStart(2, '0')}-01`;

      // Last day of current month
      const lastDay = new Date(year, month + 1, 0).getDate();
      const lastDayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

      // 1. Fetch user profile for signup date
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      setUserProfile(profileData);

      // 2. Fetch active daily target
      const { data: targetData } = await supabase
        .from('daily_targets')
        .select('*')
        .eq('user_id', user.id)
        .eq('active', true)
        .order('generated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (targetData) {
        setTargets({
          calories: Number(targetData.calories) || 2000,
          protein: Number(targetData.protein_g) || 0,
          carbs: Number(targetData.carbs_g) || 0,
          fat: Number(targetData.fat_g) || 0,
        });
      }

      // 3. Fetch food logs for current month
      const { data: logsData, error: logsErr } = await supabase
        .from('food_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('log_date', firstDayStr)
        .lte('log_date', lastDayStr)
        .order('log_date', { ascending: true });

      if (logsErr) {
        console.error('Error fetching food logs for history:', logsErr);
        setError(logsErr.message);
      } else {
        setFoodLogs(logsData || []);
      }
    } catch (err) {
      console.error('Unexpected history loading error:', err);
      setError('Unable to load history records.');
    } finally {
      setLoading(false);
    }
  }

  // Calculation helpers
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const todayDateNum = today.getDate();
  const targetCals = targets?.calories || 2000;

  // Format signup date
  const signupDateStr = userProfile?.created_at
    ? new Date(userProfile.created_at).toISOString().slice(0, 10)
    : user?.created_at
    ? new Date(user.created_at).toISOString().slice(0, 10)
    : `${year}-${String(month + 1).padStart(2, '0')}-01`;

  // Calculate This Month stats (from max(1st of month, signup date) to today)
  let monthOnTrackDays = 0;
  let monthTotalDaysSoFar = 0;
  let monthTotalRatioSum = 0;

  for (let d = 1; d <= todayDateNum; d++) {
    const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    if (dayStr >= signupDateStr) {
      monthTotalDaysSoFar += 1;
      const dayLogs = foodLogs.filter((item) => item.log_date === dayStr);
      const dayCals = dayLogs.reduce(
        (sum, item) => sum + (Number(item.calories) || 0),
        0
      );
      const ratio = dayCals / targetCals;
      monthTotalRatioSum += Math.min(ratio, 1.5);

      if (ratio >= 0.85 && ratio <= 1.15) {
        monthOnTrackDays += 1;
      }
    }
  }

  const monthOnTrackPct =
    monthTotalDaysSoFar > 0
      ? Math.round((monthOnTrackDays / monthTotalDaysSoFar) * 100)
      : 0;

  const monthAvgCompletion =
    monthTotalDaysSoFar > 0
      ? Math.min(Math.round((monthTotalRatioSum / monthTotalDaysSoFar) * 100), 100)
      : 0;

  // Calculate This Week stats (last 7 days up to today)
  let weekOnTrackDays = 0;
  let weekTotalDaysSoFar = 0;
  let weekTotalRatioSum = 0;

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    if (dayStr >= signupDateStr && dayStr <= `${year}-${String(month + 1).padStart(2, '0')}-${String(todayDateNum).padStart(2, '0')}`) {
      weekTotalDaysSoFar += 1;
      const dayLogs = foodLogs.filter((item) => item.log_date === dayStr);
      const dayCals = dayLogs.reduce(
        (sum, item) => sum + (Number(item.calories) || 0),
        0
      );
      const ratio = dayCals / targetCals;
      weekTotalRatioSum += Math.min(ratio, 1.5);

      if (ratio >= 0.85 && ratio <= 1.15) {
        weekOnTrackDays += 1;
      }
    }
  }

  const weekOnTrackPct =
    weekTotalDaysSoFar > 0
      ? Math.round((weekOnTrackDays / weekTotalDaysSoFar) * 100)
      : 0;

  const weekAvgCompletion =
    weekTotalDaysSoFar > 0
      ? Math.min(Math.round((weekTotalRatioSum / weekTotalDaysSoFar) * 100), 100)
      : 0;

  return (
    <>
      <style>{styles}</style>
      <main className="hq-history-page">
        <div className="hq-history-container">
          <header className="hq-history-header">
            <div className="hq-history-eyebrow">HQ DOPAMINE</div>
            <h1 className="hq-history-title">Nutrition History</h1>
            <p className="hq-history-subtitle">
              Track your daily consistency, weekly completion averages, and monthly target adherence.
            </p>
          </header>

          {error && <div className="hq-history-error">{error}</div>}

          {/* Side-by-side Weekly & Monthly Report Cards */}
          <div className="hq-stats-row">
            {/* THIS WEEK */}
            <div className="hq-stat-card">
              <div className="hq-stat-badge">THIS WEEK</div>
              <div className="hq-stat-main">
                <span className="hq-stat-number">
                  {weekOnTrackDays}/{weekTotalDaysSoFar || 7}
                </span>
                <span className="hq-stat-unit">days on track</span>
              </div>
              <div className="hq-stat-footer">
                <strong>{weekOnTrackPct}%</strong> on-track rate • {weekAvgCompletion}% avg target completion
              </div>
            </div>

            {/* THIS MONTH */}
            <div className="hq-stat-card">
              <div className="hq-stat-badge">THIS MONTH</div>
              <div className="hq-stat-main">
                <span className="hq-stat-number">
                  {monthOnTrackDays}/{monthTotalDaysSoFar || todayDateNum}
                </span>
                <span className="hq-stat-unit">days on track</span>
              </div>
              <div className="hq-stat-footer">
                <strong>{monthOnTrackPct}%</strong> on-track rate • {monthAvgCompletion}% avg target completion
              </div>
            </div>
          </div>

          {/* Monthly Nutrition Calendar */}
          <section className="hq-calendar-section">
            <NutritionCalendar
              foodLogs={foodLogs}
              activeTarget={targets}
              userCreatedAt={signupDateStr}
              currentDate={today}
            />
          </section>
        </div>
      </main>
    </>
  );
}

const styles = `
  .hq-history-page {
    min-height: calc(100vh - 64px);
    box-sizing: border-box;
    padding: 42px 24px 80px;
    color: #10241E;
    font-family: var(--font-body);
  }

  .hq-history-container {
    width: 100%;
    max-width: 900px;
    margin: 0 auto;
  }

  .hq-history-header {
    margin-bottom: 28px;
  }

  .hq-history-eyebrow {
    margin-bottom: 8px;
    color: #1F9E76;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
  }

  .hq-history-title {
    margin: 0;
    color: #10241E;
    font-family: var(--font-display);
    font-size: 36px;
    line-height: 1.1;
    font-weight: 700;
    letter-spacing: -0.5px;
  }

  .hq-history-subtitle {
    margin: 10px 0 0;
    color: #5B6B65;
    font-size: 15px;
  }

  .hq-history-error {
    padding: 12px;
    margin-bottom: 20px;
    border: 1px solid rgba(239, 68, 68, 0.25);
    border-radius: 10px;
    background: rgba(239, 68, 68, 0.1);
    color: #dc2626;
    font-size: 13px;
  }

  .hq-stats-row {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    margin-bottom: 32px;
  }

  .hq-stat-card {
    padding: 24px;
    border: 1px solid rgba(255, 255, 255, 0.9);
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.65);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    box-shadow: 0 10px 28px rgba(16, 36, 30, 0.05);
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .hq-stat-badge {
    color: #1F9E76;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 1.5px;
  }

  .hq-stat-main {
    display: flex;
    align-items: baseline;
    gap: 8px;
  }

  .hq-stat-number {
    font-family: var(--font-mono);
    font-size: 36px;
    font-weight: 800;
    color: #10241E;
    letter-spacing: -1px;
  }

  .hq-stat-unit {
    color: #5B6B65;
    font-size: 14px;
    font-weight: 500;
  }

  .hq-stat-footer {
    font-size: 13px;
    color: #5B6B65;
    border-top: 1px solid rgba(16, 36, 30, 0.06);
    padding-top: 10px;
    margin-top: 4px;
  }

  .hq-calendar-section {
    margin-top: 10px;
  }

  @media (max-width: 600px) {
    .hq-stats-row {
      grid-template-columns: 1fr;
    }
  }
`;
