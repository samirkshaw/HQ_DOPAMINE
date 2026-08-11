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
    <main className="min-h-[calc(100vh-64px)] px-4 py-8 sm:px-6 sm:py-12 text-[#10241E]">
      <div className="w-full max-w-4xl mx-auto">
        <header className="mb-7">
          <div className="text-[#1F9E76] text-xs font-bold tracking-widest uppercase mb-2">
            HQ DOPAMINE
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#10241E] tracking-tight leading-tight">
            Nutrition History
          </h1>
          <p className="mt-2.5 text-[#5B6B65] text-sm sm:text-base leading-relaxed">
            Track your daily consistency, weekly completion averages, and monthly target adherence.
          </p>
        </header>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-600 text-xs sm:text-sm">
            {error}
          </div>
        )}

        {/* Side-by-side / Stacked Weekly & Monthly Report Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-8">
          {/* THIS WEEK */}
          <div className="glass-card p-5 sm:p-6 rounded-2xl flex flex-col gap-2.5">
            <div className="text-[#1F9E76] text-[11px] font-extrabold tracking-wider">
              THIS WEEK
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-3xl sm:text-4xl font-extrabold text-[#10241E] tracking-tight">
                {weekOnTrackDays}/{weekTotalDaysSoFar || 7}
              </span>
              <span className="text-[#5B6B65] text-sm font-medium">days on track</span>
            </div>
            <div className="text-xs sm:text-sm text-[#5B6B65] border-t border-[#10241E]/6 pt-2.5 mt-1">
              <strong className="text-[#10241E] font-semibold">{weekOnTrackPct}%</strong> on-track rate • {weekAvgCompletion}% avg target completion
            </div>
          </div>

          {/* THIS MONTH */}
          <div className="glass-card p-5 sm:p-6 rounded-2xl flex flex-col gap-2.5">
            <div className="text-[#1F9E76] text-[11px] font-extrabold tracking-wider">
              THIS MONTH
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-3xl sm:text-4xl font-extrabold text-[#10241E] tracking-tight">
                {monthOnTrackDays}/{monthTotalDaysSoFar || todayDateNum}
              </span>
              <span className="text-[#5B6B65] text-sm font-medium">days on track</span>
            </div>
            <div className="text-xs sm:text-sm text-[#5B6B65] border-t border-[#10241E]/6 pt-2.5 mt-1">
              <strong className="text-[#10241E] font-semibold">{monthOnTrackPct}%</strong> on-track rate • {monthAvgCompletion}% avg target completion
            </div>
          </div>
        </div>

        {/* Monthly Nutrition Calendar */}
        <section className="mt-2">
          <NutritionCalendar
            foodLogs={foodLogs}
            activeTarget={targets}
            userCreatedAt={signupDateStr}
            currentDate={today}
          />
        </section>
      </div>
    </main>
  );
}

