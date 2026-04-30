export interface User {
    id: string
    name: string
    email: string
    phone: string
    password: string
    role: "admin" | "member"
    createdAt: string
}

export const initialUsers: User[] = [
    {
        id: "user-admin-1",
        name: "Admin Gym",
        email: "admin@gymprototype.com",
        phone: "08123456789",
        password: "admin123",
        role: "admin",
        createdAt: "2024-01-01T00:00:00.000Z",
    },
    {
        id: "user-member-1",
        name: "Budi Santoso",
        email: "member@gymprototype.com",
        phone: "08234567890",
        password: "member123",
        role: "member",
        createdAt: "2024-01-15T00:00:00.000Z",
    },
    {
        id: "user-member-2",
        name: "Siti Rahayu",
        email: "siti@example.com",
        phone: "08345678901",
        password: "password123",
        role: "member",
        createdAt: "2024-02-01T00:00:00.000Z",
    },
    {
        id: "user-member-3",
        name: "Ahmad Fauzi",
        email: "ahmad@example.com",
        phone: "08456789012",
        password: "password123",
        role: "member",
        createdAt: "2024-02-10T00:00:00.000Z",
    },
]
