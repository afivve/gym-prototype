export type PhotoVisibility = "private" | "public";

export interface ProgressPhoto {
    id: string;
    userId: string;
    date: string; // ISO date string
    front: string; // base64 data URL — required
    side?: string; // base64 data URL — optional
    back?: string; // base64 data URL — optional
    visibility: PhotoVisibility;
    notes?: string;
}

const STORAGE_KEY = "gym_progress_photos";

export function getPhotos(userId: string): ProgressPhoto[] {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    try {
        const all = JSON.parse(stored) as ProgressPhoto[];
        return all
            .filter((p) => p.userId === userId)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } catch {
        return [];
    }
}

export function getLatestPhoto(userId: string): ProgressPhoto | null {
    const all = getPhotos(userId);
    return all.length > 0 ? all[all.length - 1] : null;
}

export function addPhoto(photo: ProgressPhoto): void {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(STORAGE_KEY);
    let all: ProgressPhoto[] = [];
    if (stored) {
        try {
            all = JSON.parse(stored) as ProgressPhoto[];
        } catch {
            all = [];
        }
    }
    all.push(photo);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function deletePhoto(id: string): void {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    try {
        const all = (JSON.parse(stored) as ProgressPhoto[]).filter((p) => p.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    } catch {
        // noop
    }
}
