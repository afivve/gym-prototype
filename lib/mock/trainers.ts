export interface Trainer {
    id: string;
    name: string;
    specialties: string[];
    description: string;
    pricePerSession: number;
    rating: number; // 1-5
    totalSessionsCompleted: number;
    isActive: boolean;
    createdAt: string;
}

const STORAGE_KEY = "gym_trainers";

export const initialTrainers: Trainer[] = [
    {
        id: "trainer-1",
        name: "Ahmad Rizki",
        specialties: ["Strength Training", "Powerlifting"],
        description:
            "Spesialis kekuatan dengan pengalaman 5 tahun. Pernah melatih atlet nasional dan membantu ratusan member mencapai target mereka.",
        pricePerSession: 150000,
        rating: 4.9,
        totalSessionsCompleted: 312,
        isActive: true,
        createdAt: "2024-01-05T00:00:00.000Z",
    },
    {
        id: "trainer-2",
        name: "Dewi Rahayu",
        specialties: ["Weight Loss", "Cardio", "Nutrition"],
        description:
            "Ahli penurunan berat badan dengan pendekatan holistik. Kombinasi latihan kardio dan panduan nutrisi untuk hasil maksimal.",
        pricePerSession: 120000,
        rating: 4.7,
        totalSessionsCompleted: 248,
        isActive: true,
        createdAt: "2024-02-10T00:00:00.000Z",
    },
    {
        id: "trainer-3",
        name: "Bima Arjuna",
        specialties: ["Functional Training", "HIIT", "Calisthenics"],
        description:
            "Certified functional trainer dengan spesialisasi HIIT dan calisthenics. Fokus pada performa atletik dan mobilitas fungsional.",
        pricePerSession: 130000,
        rating: 4.8,
        totalSessionsCompleted: 189,
        isActive: true,
        createdAt: "2024-03-01T00:00:00.000Z",
    },
    {
        id: "trainer-4",
        name: "Sari Indah",
        specialties: ["Yoga", "Flexibility", "Recovery"],
        description:
            "Instruktur yoga bersertifikat internasional. Membantu member meningkatkan fleksibilitas, keseimbangan, dan pemulihan pasca-latihan.",
        pricePerSession: 100000,
        rating: 4.6,
        totalSessionsCompleted: 156,
        isActive: true,
        createdAt: "2024-03-15T00:00:00.000Z",
    },
];

function loadAll(): Trainer[] {
    if (typeof window === "undefined") return initialTrainers;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialTrainers));
        return initialTrainers;
    }
    try {
        return JSON.parse(stored) as Trainer[];
    } catch {
        return initialTrainers;
    }
}

function saveAll(data: Trainer[]): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getTrainers(): Trainer[] {
    return loadAll()
        .filter((t) => t.isActive)
        .sort((a, b) => b.rating - a.rating);
}

export function getAllTrainers(): Trainer[] {
    return loadAll().sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

export function getTrainerById(id: string): Trainer | null {
    return loadAll().find((t) => t.id === id) ?? null;
}

export function addTrainer(trainer: Trainer): void {
    const all = loadAll();
    all.push(trainer);
    saveAll(all);
}

export function updateTrainer(updated: Trainer): void {
    const all = loadAll();
    const idx = all.findIndex((t) => t.id === updated.id);
    if (idx !== -1) all[idx] = updated;
    saveAll(all);
}

export function deleteTrainer(id: string): void {
    saveAll(loadAll().filter((t) => t.id !== id));
}
