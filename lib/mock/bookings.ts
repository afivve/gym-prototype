export interface Booking {
    id: string
    userId: string
    classId: string
    status: "confirmed" | "cancelled"
    bookedAt: string
}

export const initialBookings: Booking[] = [
    {
        id: "booking-1",
        userId: "user-member-1",
        classId: "class-1",
        status: "confirmed",
        bookedAt: "2026-04-20T10:00:00.000Z",
    },
    {
        id: "booking-2",
        userId: "user-member-1",
        classId: "class-4",
        status: "confirmed",
        bookedAt: "2026-04-21T08:30:00.000Z",
    },
    {
        id: "booking-3",
        userId: "user-member-2",
        classId: "class-2",
        status: "confirmed",
        bookedAt: "2026-04-19T14:00:00.000Z",
    },
    {
        id: "booking-4",
        userId: "user-member-3",
        classId: "class-5",
        status: "cancelled",
        bookedAt: "2026-04-18T11:00:00.000Z",
    },
]
