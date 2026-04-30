export interface GymClass {
    id: string
    name: string
    instructor: string
    scheduleLabel: string
    scheduleDay: string
    scheduleTime: string
    duration: number
    quota: number
    bookedCount: number
    category: string
    description: string
    colorClass: string
}

export const initialClasses: GymClass[] = [
    {
        id: "class-1",
        name: "Yoga Morning",
        instructor: "Dewi Kusuma",
        scheduleLabel: "Senin, Rabu, Jumat",
        scheduleDay: "Senin / Rabu / Jumat",
        scheduleTime: "07:00 – 08:00",
        duration: 60,
        quota: 15,
        bookedCount: 8,
        category: "Yoga",
        description:
            "Sesi yoga pagi yang menenangkan untuk memulai hari dengan penuh energi. Cocok untuk semua level.",
        colorClass: "bg-purple-100 text-purple-700",
    },
    {
        id: "class-2",
        name: "Zumba Party",
        instructor: "Rina Maharani",
        scheduleLabel: "Selasa, Kamis",
        scheduleDay: "Selasa / Kamis",
        scheduleTime: "17:00 – 18:00",
        duration: 60,
        quota: 20,
        bookedCount: 15,
        category: "Zumba",
        description:
            "Olahraga seru dengan gerakan tari Latin yang menyenangkan. Bakar kalori sambil bersenang-senang!",
        colorClass: "bg-pink-100 text-pink-700",
    },
    {
        id: "class-3",
        name: "Personal Training",
        instructor: "Rudi Gunawan",
        scheduleLabel: "Setiap Hari (janji temu)",
        scheduleDay: "Setiap hari",
        scheduleTime: "08:00 – 09:00",
        duration: 60,
        quota: 1,
        bookedCount: 0,
        category: "Personal Training",
        description:
            "Sesi latihan personal bersama trainer profesional. Program disesuaikan dengan target dan kondisi Anda.",
        colorClass: "bg-blue-100 text-blue-700",
    },
    {
        id: "class-4",
        name: "HIIT Power",
        instructor: "Bagas Pratama",
        scheduleLabel: "Senin, Selasa, Kamis",
        scheduleDay: "Senin / Selasa / Kamis",
        scheduleTime: "06:00 – 07:00",
        duration: 60,
        quota: 12,
        bookedCount: 10,
        category: "HIIT",
        description:
            "High Intensity Interval Training untuk memaksimalkan pembakaran lemak dan meningkatkan stamina.",
        colorClass: "bg-orange-100 text-orange-700",
    },
    {
        id: "class-5",
        name: "Pilates Core",
        instructor: "Maya Sari",
        scheduleLabel: "Rabu, Jumat",
        scheduleDay: "Rabu / Jumat",
        scheduleTime: "16:00 – 17:00",
        duration: 60,
        quota: 10,
        bookedCount: 6,
        category: "Pilates",
        description:
            "Latihan pilates untuk memperkuat otot inti, meningkatkan fleksibilitas, dan postur tubuh.",
        colorClass: "bg-green-100 text-green-700",
    },
    {
        id: "class-6",
        name: "Kickboxing Fit",
        instructor: "Hendra Wijaya",
        scheduleLabel: "Selasa, Sabtu",
        scheduleDay: "Selasa / Sabtu",
        scheduleTime: "19:00 – 20:00",
        duration: 60,
        quota: 15,
        bookedCount: 3,
        category: "Kickboxing",
        description:
            "Kombinasi teknik kickboxing dan fitness untuk meningkatkan kekuatan, kelincahan, dan kepercayaan diri.",
        colorClass: "bg-red-100 text-red-700",
    },
]
