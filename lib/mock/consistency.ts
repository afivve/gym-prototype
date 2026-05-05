import type { CheckIn } from "./checkins";
import type { WorkoutSession } from "./workouts";

/** Normalise an ISO timestamp to "YYYY-MM-DD" in local time. */
export function toDateStr(iso: string): string {
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

/** Today as "YYYY-MM-DD". */
export function todayStr(): string {
    return toDateStr(new Date().toISOString());
}

/** Union of unique activity dates from check-ins + workouts (sorted asc). */
export function getActivityDates(
    checkIns: CheckIn[],
    workouts: WorkoutSession[],
): string[] {
    const set = new Set<string>();
    checkIns.forEach((c) => set.add(toDateStr(c.checkedInAt)));
    workouts.forEach((w) => set.add(w.date.slice(0, 10)));
    return Array.from(set).sort();
}

/** Total unique days active (all time). */
export function getTotalAttendance(
    checkIns: CheckIn[],
    workouts: WorkoutSession[],
): number {
    return getActivityDates(checkIns, workouts).length;
}

/**
 * Current streak: consecutive days ending today or yesterday.
 * Counts backwards from today; also accepts yesterday as "latest" (user
 * might not have gone yet today).
 */
export function getCurrentStreak(
    checkIns: CheckIn[],
    workouts: WorkoutSession[],
): number {
    const dates = getActivityDates(checkIns, workouts);
    if (dates.length === 0) return 0;

    const today = todayStr();
    const yesterday = toDateStr(
        new Date(Date.now() - 86_400_000).toISOString(),
    );

    const latest = dates[dates.length - 1];
    // streak is broken if latest activity is older than yesterday
    if (latest !== today && latest !== yesterday) return 0;

    let streak = 1;
    for (let i = dates.length - 2; i >= 0; i--) {
        const curr = new Date(dates[i + 1] + "T00:00:00");
        const prev = new Date(dates[i] + "T00:00:00");
        const diffDays = Math.round(
            (curr.getTime() - prev.getTime()) / 86_400_000,
        );
        if (diffDays === 1) {
            streak++;
        } else {
            break;
        }
    }
    return streak;
}

/** Longest streak ever. */
export function getLongestStreak(
    checkIns: CheckIn[],
    workouts: WorkoutSession[],
): number {
    const dates = getActivityDates(checkIns, workouts);
    if (dates.length === 0) return 0;
    let best = 1;
    let current = 1;
    for (let i = 1; i < dates.length; i++) {
        const prev = new Date(dates[i - 1] + "T00:00:00");
        const curr = new Date(dates[i] + "T00:00:00");
        const diff = Math.round((curr.getTime() - prev.getTime()) / 86_400_000);
        if (diff === 1) {
            current++;
            if (current > best) best = current;
        } else {
            current = 1;
        }
    }
    return best;
}

/** Unique workout sessions this calendar month. */
export function getMonthlyWorkouts(workouts: WorkoutSession[]): number {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    return workouts.filter((w) => {
        const d = new Date(w.date);
        return d.getFullYear() === y && d.getMonth() === m;
    }).length;
}

/** Most frequent check-in hour bracket (e.g. "06:00–08:00"). */
export function getFavoriteHour(checkIns: CheckIn[]): string | null {
    if (checkIns.length === 0) return null;
    const counts: Record<number, number> = {};
    checkIns.forEach((c) => {
        const h = new Date(c.checkedInAt).getHours();
        counts[h] = (counts[h] ?? 0) + 1;
    });
    const peak = Number(
        Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0],
    );
    const end = peak + 2;
    const fmt = (n: number) => `${String(n % 24).padStart(2, "0")}:00`;
    return `${fmt(peak)}–${fmt(end)}`;
}

/**
 * Activity counts per day for the last `days` calendar days (for heatmap).
 * Returns array of { date: "YYYY-MM-DD"; count: number } sorted asc.
 */
export function getHeatmapData(
    checkIns: CheckIn[],
    workouts: WorkoutSession[],
    days = 91, // ~13 weeks
): { date: string; count: number }[] {
    const countMap: Record<string, number> = {};
    checkIns.forEach((c) => {
        const d = toDateStr(c.checkedInAt);
        countMap[d] = (countMap[d] ?? 0) + 1;
    });
    workouts.forEach((w) => {
        const d = w.date.slice(0, 10);
        // Only add if not already counted (checkin may also exist same day)
        // We want to show "activity happened" — cap at an extra count
        countMap[d] = (countMap[d] ?? 0) + 1;
    });

    const result: { date: string; count: number }[] = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
        const d = toDateStr(
            new Date(now.getTime() - i * 86_400_000).toISOString(),
        );
        result.push({ date: d, count: countMap[d] ?? 0 });
    }
    return result;
}

/** Activity counts per ISO-week for the last N weeks. */
export function getWeeklyData(
    checkIns: CheckIn[],
    workouts: WorkoutSession[],
    weeks = 8,
): { label: string; count: number }[] {
    const heatmap = getHeatmapData(checkIns, workouts, weeks * 7);
    const buckets: Record<string, number> = {};

    heatmap.forEach(({ date, count }) => {
        if (count === 0) return;
        // ISO week string: "YYYY-Www"
        const d = new Date(date + "T00:00:00");
        const thursday = new Date(d);
        thursday.setDate(d.getDate() - d.getDay() + 4);
        const year = thursday.getFullYear();
        const startOfYear = new Date(year, 0, 1);
        const week = Math.ceil(
            ((thursday.getTime() - startOfYear.getTime()) / 86_400_000 + 1) / 7,
        );
        const key = `${year}-W${String(week).padStart(2, "0")}`;
        buckets[key] = (buckets[key] ?? 0) + 1;
    });

    // Build last N ISO weeks from today
    const result: { label: string; count: number }[] = [];
    const today = new Date();
    for (let i = weeks - 1; i >= 0; i--) {
        const d = new Date(today.getTime() - i * 7 * 86_400_000);
        const thursday = new Date(d);
        thursday.setDate(d.getDate() - d.getDay() + 4);
        const year = thursday.getFullYear();
        const startOfYear = new Date(year, 0, 1);
        const week = Math.ceil(
            ((thursday.getTime() - startOfYear.getTime()) / 86_400_000 + 1) / 7,
        );
        const key = `${year}-W${String(week).padStart(2, "0")}`;
        // Short label: "W12" or "Apr 28"
        const monday = new Date(d);
        monday.setDate(d.getDate() - d.getDay() + 1);
        const label = monday.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
        });
        result.push({ label, count: buckets[key] ?? 0 });
    }
    return result;
}
