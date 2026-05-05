export type MaintenanceStatus = "scheduled" | "in_progress" | "completed";

export interface MaintenanceRecord {
    id: string;
    equipmentName: string;
    location?: string;
    scheduledDate: string; // "YYYY-MM-DD"
    status: MaintenanceStatus;
    notes?: string;
    createdAt: string;
}

const STORAGE_KEY = "gym_maintenance";

export const initialMaintenance: MaintenanceRecord[] = [
    {
        id: "maint-1",
        equipmentName: "Treadmill #1",
        location: "Cardio Area",
        scheduledDate: "2026-04-28",
        status: "completed",
        notes: "Penggantian belt dan pelumas motor",
        createdAt: "2026-04-20T00:00:00.000Z",
    },
    {
        id: "maint-2",
        equipmentName: "Rowing Machine",
        location: "Cardio Area",
        scheduledDate: "2026-04-20",
        status: "completed",
        notes: "Kalibrasi resistansi dan pengecekan frame",
        createdAt: "2026-04-10T00:00:00.000Z",
    },
    {
        id: "maint-3",
        equipmentName: "Leg Press Machine",
        location: "Strength Zone",
        scheduledDate: "2026-05-02",
        status: "in_progress",
        notes: "Penggantian bantalan duduk dan servis sistem hidrolik",
        createdAt: "2026-04-25T00:00:00.000Z",
    },
    {
        id: "maint-4",
        equipmentName: "Barbell & Plate Set",
        location: "Free Weight Area",
        scheduledDate: "2026-05-10",
        status: "scheduled",
        notes: "Pemeriksaan rutin bulanan, pembersihan, dan pengecatan ulang",
        createdAt: "2026-04-28T00:00:00.000Z",
    },
    {
        id: "maint-5",
        equipmentName: "Cable Machine",
        location: "Strength Zone",
        scheduledDate: "2026-05-15",
        status: "scheduled",
        notes: "Penggantian kabel dan pulley serta pelumasan guide rod",
        createdAt: "2026-05-01T00:00:00.000Z",
    },
    {
        id: "maint-6",
        equipmentName: "Elliptical Trainer #2",
        location: "Cardio Area",
        scheduledDate: "2026-04-30",
        status: "scheduled",
        notes: "Servis berkala — belum dilaksanakan",
        createdAt: "2026-04-22T00:00:00.000Z",
    },
];

function loadAll(): MaintenanceRecord[] {
    if (typeof window === "undefined") return initialMaintenance;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMaintenance));
        return initialMaintenance;
    }
    try {
        return JSON.parse(stored) as MaintenanceRecord[];
    } catch {
        return initialMaintenance;
    }
}

function saveAll(data: MaintenanceRecord[]): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getAllMaintenance(): MaintenanceRecord[] {
    return loadAll().sort(
        (a, b) =>
            new Date(a.scheduledDate).getTime() -
            new Date(b.scheduledDate).getTime(),
    );
}

export function addMaintenance(record: MaintenanceRecord): void {
    const all = loadAll();
    all.push(record);
    saveAll(all);
}

export function updateMaintenance(updated: MaintenanceRecord): void {
    const all = loadAll();
    const idx = all.findIndex((r) => r.id === updated.id);
    if (idx !== -1) all[idx] = updated;
    saveAll(all);
}

export function deleteMaintenance(id: string): void {
    saveAll(loadAll().filter((r) => r.id !== id));
}

/** Returns "overdue" | "upcoming" | "normal" for color coding. */
export function getMaintenanceUrgency(
    record: MaintenanceRecord,
): "overdue" | "upcoming" | "normal" {
    if (record.status === "completed") return "normal";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const scheduled = new Date(record.scheduledDate + "T00:00:00");
    const diffDays = Math.ceil(
        (scheduled.getTime() - today.getTime()) / 86_400_000,
    );
    if (diffDays < 0) return "overdue";
    if (diffDays <= 7) return "upcoming";
    return "normal";
}
