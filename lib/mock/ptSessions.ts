export interface PtSession {
    id: string;
    trainerId: string;
    clientId: string; // user id
    date: string; // "YYYY-MM-DD"
    time: string; // "HH:MM"
    durationMinutes: number;
    price: number;
    status: "scheduled" | "completed" | "cancelled";
    paymentStatus: "unpaid" | "paid";
    notes?: string;
    createdAt: string;
}

const STORAGE_KEY = "gym_pt_sessions";

export const initialPtSessions: PtSession[] = [
    {
        id: "pts-1",
        trainerId: "trainer-1",
        clientId: "user-member-1",
        date: "2026-05-06",
        time: "08:00",
        durationMinutes: 60,
        price: 150000,
        status: "scheduled",
        paymentStatus: "unpaid",
        createdAt: "2026-05-01T00:00:00.000Z",
    },
    {
        id: "pts-2",
        trainerId: "trainer-2",
        clientId: "user-member-1",
        date: "2026-04-28",
        time: "10:00",
        durationMinutes: 60,
        price: 120000,
        status: "completed",
        paymentStatus: "paid",
        createdAt: "2026-04-20T00:00:00.000Z",
    },
    {
        id: "pts-3",
        trainerId: "trainer-3",
        clientId: "user-member-1",
        date: "2026-04-15",
        time: "16:00",
        durationMinutes: 60,
        price: 130000,
        status: "completed",
        paymentStatus: "paid",
        createdAt: "2026-04-10T00:00:00.000Z",
    },
];

function loadAll(): PtSession[] {
    if (typeof window === "undefined") return initialPtSessions;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialPtSessions));
        return initialPtSessions;
    }
    try {
        return JSON.parse(stored) as PtSession[];
    } catch {
        return initialPtSessions;
    }
}

function saveAll(data: PtSession[]): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function sortByDateDesc(sessions: PtSession[]): PtSession[] {
    return sessions.sort((a, b) => {
        const da = new Date(`${a.date}T${a.time}`);
        const db = new Date(`${b.date}T${b.time}`);
        return db.getTime() - da.getTime();
    });
}

export function getAllPtSessions(): PtSession[] {
    return sortByDateDesc(loadAll());
}

export function getPtSessionsByClient(clientId: string): PtSession[] {
    return sortByDateDesc(loadAll().filter((s) => s.clientId === clientId));
}

export function getPtSessionsByTrainer(trainerId: string): PtSession[] {
    return loadAll()
        .filter((s) => s.trainerId === trainerId)
        .sort((a, b) => {
            const da = new Date(`${a.date}T${a.time}`);
            const db = new Date(`${b.date}T${b.time}`);
            return da.getTime() - db.getTime();
        });
}

export function addPtSession(session: PtSession): void {
    const all = loadAll();
    all.push(session);
    saveAll(all);
}

export function updatePtSession(updated: PtSession): void {
    const all = loadAll();
    const idx = all.findIndex((s) => s.id === updated.id);
    if (idx !== -1) all[idx] = updated;
    saveAll(all);
}

export function deletePtSession(id: string): void {
    saveAll(loadAll().filter((s) => s.id !== id));
}
