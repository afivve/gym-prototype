export type FitnessGoal =
    | "fat_loss"
    | "muscle_gain"
    | "maintenance"
    | "strength"
    | "rehab";

export type FitnessLevel = "beginner" | "intermediate" | "advanced";

export interface FitnessProfile {
    userId: string;
    name: string;
    age: number;
    gender: "male" | "female";
    height: number;
    weight: number;
    goal: FitnessGoal;
    level: FitnessLevel;
    injuryNotes: string;
    progressPhoto: string;
    updatedAt: string;
}

const STORAGE_KEY = "gym_fitness_profiles";

export function getProfile(userId: string): FitnessProfile | null {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    try {
        const profiles = JSON.parse(stored) as FitnessProfile[];
        return profiles.find((p) => p.userId === userId) ?? null;
    } catch {
        return null;
    }
}

export function saveProfile(profile: FitnessProfile): void {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(STORAGE_KEY);
    let profiles: FitnessProfile[] = [];
    if (stored) {
        try {
            profiles = JSON.parse(stored) as FitnessProfile[];
        } catch {
            profiles = [];
        }
    }
    const idx = profiles.findIndex((p) => p.userId === profile.userId);
    if (idx >= 0) {
        profiles[idx] = profile;
    } else {
        profiles.push(profile);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
}
