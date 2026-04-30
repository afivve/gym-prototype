export interface CheckIn {
    id: string
    userId: string
    checkedInAt: string
    method: "qr" | "manual"
}

export const initialCheckIns: CheckIn[] = [
    {
        id: "checkin-1",
        userId: "user-member-1",
        checkedInAt: "2026-04-28T07:05:00.000Z",
        method: "qr",
    },
    {
        id: "checkin-2",
        userId: "user-member-1",
        checkedInAt: "2026-04-27T07:12:00.000Z",
        method: "qr",
    },
    {
        id: "checkin-3",
        userId: "user-member-2",
        checkedInAt: "2026-04-27T17:02:00.000Z",
        method: "manual",
    },
    {
        id: "checkin-4",
        userId: "user-member-1",
        checkedInAt: "2026-04-26T08:00:00.000Z",
        method: "qr",
    },
    {
        id: "checkin-5",
        userId: "user-member-3",
        checkedInAt: "2026-04-25T06:30:00.000Z",
        method: "manual",
    },
]
