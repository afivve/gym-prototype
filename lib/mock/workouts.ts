export interface Exercise {
    name: string;
    sets: number;
    reps: number;
    weight: number; // kg
    notes?: string;
}

export interface WorkoutSession {
    id: string;
    userId: string;
    date: string; // ISO date string
    program: string; // e.g. "Push Day", "Pull Day"
    duration: number; // minutes
    notes?: string;
    exercises: Exercise[];
}

const STORAGE_KEY = "gym_workouts";

export function getWorkouts(userId: string): WorkoutSession[] {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    try {
        const all = JSON.parse(stored) as WorkoutSession[];
        return all
            .filter((w) => w.userId === userId)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch {
        return [];
    }
}

export function getWorkoutById(id: string): WorkoutSession | null {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    try {
        const all = JSON.parse(stored) as WorkoutSession[];
        return all.find((w) => w.id === id) ?? null;
    } catch {
        return null;
    }
}

export function addWorkout(session: WorkoutSession): void {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(STORAGE_KEY);
    let all: WorkoutSession[] = [];
    if (stored) {
        try {
            all = JSON.parse(stored) as WorkoutSession[];
        } catch {
            all = [];
        }
    }
    all.push(session);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function deleteWorkout(id: string): void {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    try {
        const all = (JSON.parse(stored) as WorkoutSession[]).filter(
            (w) => w.id !== id,
        );
        localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    } catch {
        // noop
    }
}

export function calcVolume(exercises: Exercise[]): number {
    return exercises.reduce((sum, e) => sum + e.sets * e.reps * e.weight, 0);
}

export const PROGRAM_TEMPLATES = [
    "Push Day",
    "Pull Day",
    "Leg Day",
    "Upper Body",
    "Lower Body",
    "Full Body",
    "Chest & Tricep",
    "Back & Bicep",
    "Shoulder",
    "Cardio",
    "Core",
];
