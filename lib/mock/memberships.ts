export interface Membership {
    id: string
    userId: string
    plan: "weekly" | "monthly"
    status: "pending" | "active" | "expired"
    startDate: string
    endDate: string
    price: number
    createdAt: string
}

export const MEMBERSHIP_PLANS = {
    weekly: {
        key: "weekly" as const,
        name: "Mingguan",
        price: 75000,
        durationDays: 7,
        description: "Akses gym penuh selama 7 hari",
        features: [
            "Akses semua fasilitas gym",
            "Loker gratis",
            "Air minum gratis",
            "Handuk gratis",
        ],
        popular: false,
    },
    monthly: {
        key: "monthly" as const,
        name: "Bulanan",
        price: 250000,
        durationDays: 30,
        description: "Akses gym penuh selama 30 hari",
        features: [
            "Akses semua fasilitas gym",
            "Loker gratis",
            "Air minum gratis",
            "Handuk gratis",
            "Akses kelas grup tak terbatas",
            "Konsultasi trainer 1x/bulan",
        ],
        popular: true,
    },
}

export const initialMemberships: Membership[] = [
    {
        id: "membership-1",
        userId: "user-member-1",
        plan: "monthly",
        status: "active",
        startDate: "2026-04-01T00:00:00.000Z",
        endDate: "2026-04-30T23:59:59.000Z",
        price: 250000,
        createdAt: "2026-04-01T08:00:00.000Z",
    },
    {
        id: "membership-2",
        userId: "user-member-2",
        plan: "weekly",
        status: "pending",
        startDate: "2026-04-10T00:00:00.000Z",
        endDate: "2026-04-17T23:59:59.000Z",
        price: 75000,
        createdAt: "2026-04-10T09:00:00.000Z",
    },
    {
        id: "membership-3",
        userId: "user-member-3",
        plan: "monthly",
        status: "expired",
        startDate: "2026-03-01T00:00:00.000Z",
        endDate: "2026-03-31T23:59:59.000Z",
        price: 250000,
        createdAt: "2026-03-01T08:00:00.000Z",
    },
]
