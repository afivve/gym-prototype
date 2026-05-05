export interface Measurement {
    id: string;
    userId: string;
    date: string; // ISO date string
    weight: number; // kg — required
    bodyFat?: number; // % — optional
    bmi?: number; // auto-calculated
    chest?: number; // cm
    waist?: number; // cm
    arm?: number; // cm
    thigh?: number; // cm
    hip?: number; // cm
    calf?: number; // cm
    notes?: string;
}

const STORAGE_KEY = "gym_measurements";

export function getMeasurements(userId: string): Measurement[] {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    try {
        const all = JSON.parse(stored) as Measurement[];
        return all
            .filter((m) => m.userId === userId)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } catch {
        return [];
    }
}

export function getLatestMeasurement(userId: string): Measurement | null {
    const all = getMeasurements(userId);
    return all.length > 0 ? all[all.length - 1] : null;
}

export function addMeasurement(m: Measurement): void {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(STORAGE_KEY);
    let all: Measurement[] = [];
    if (stored) {
        try {
            all = JSON.parse(stored) as Measurement[];
        } catch {
            all = [];
        }
    }
    all.push(m);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function deleteMeasurement(id: string): void {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    try {
        const all = (JSON.parse(stored) as Measurement[]).filter((m) => m.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    } catch {
        // noop
    }
}

export function calcBmi(weight: number, heightCm: number): number {
    if (heightCm <= 0) return 0;
    const heightM = heightCm / 100;
    return Math.round((weight / (heightM * heightM)) * 10) / 10;
}
