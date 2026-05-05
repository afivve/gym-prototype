import { z } from "zod"

export const registerSchema = z
    .object({
        name: z.string().min(2, "Nama minimal 2 karakter"),
        email: z.string().email("Format email tidak valid"),
        phone: z
            .string()
            .min(10, "No HP minimal 10 digit")
            .regex(/^[0-9+\-\s()]+$/, "Format no HP tidak valid"),
        password: z.string().min(8, "Password minimal 8 karakter"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Konfirmasi password tidak sama",
        path: ["confirmPassword"],
    })

export const loginSchema = z.object({
    email: z.string().email("Format email tidak valid"),
    password: z.string().min(1, "Password wajib diisi"),
})

export const membershipSchema = z.object({
    plan: z.enum(["weekly", "monthly"], {
        message: "Pilih paket membership",
    }),
})

export const bookingSchema = z.object({
    classId: z.string().min(1, "Pilih kelas terlebih dahulu"),
})

export const checkinSchema = z.object({
    emailOrId: z.string().min(1, "Email atau ID member wajib diisi"),
})

export const profileSchema = z.object({
    name: z.string().min(2, "Nama minimal 2 karakter"),
    age: z
        .number({ message: "Umur wajib diisi" })
        .min(1, "Umur harus lebih dari 0")
        .max(120, "Umur tidak valid"),
    gender: z.enum(["male", "female"], { message: "Pilih jenis kelamin" }),
    height: z
        .number({ message: "Tinggi badan wajib diisi" })
        .min(1, "Tinggi harus lebih dari 0"),
    weight: z
        .number({ message: "Berat badan wajib diisi" })
        .min(1, "Berat harus lebih dari 0"),
    goal: z.enum(["fat_loss", "muscle_gain", "maintenance", "strength", "rehab"], {
        message: "Pilih tujuan fitness",
    }),
    level: z.enum(["beginner", "intermediate", "advanced"], {
        message: "Pilih level latihan",
    }),
    injuryNotes: z.string().optional(),
    progressPhoto: z.string().optional(),
})

export const measurementSchema = z.object({
    date: z.string().min(1, "Tanggal wajib diisi"),
    weight: z
        .number({ message: "Berat badan wajib diisi" })
        .min(0.1, "Berat harus lebih dari 0"),
    bodyFat: z
        .number()
        .min(0, "Minimal 0%")
        .max(100, "Maksimal 100%")
        .optional()
        .or(z.literal(NaN).transform(() => undefined)),
    chest: z.number().min(0).optional().or(z.literal(NaN).transform(() => undefined)),
    waist: z.number().min(0).optional().or(z.literal(NaN).transform(() => undefined)),
    arm: z.number().min(0).optional().or(z.literal(NaN).transform(() => undefined)),
    thigh: z.number().min(0).optional().or(z.literal(NaN).transform(() => undefined)),
    hip: z.number().min(0).optional().or(z.literal(NaN).transform(() => undefined)),
    calf: z.number().min(0).optional().or(z.literal(NaN).transform(() => undefined)),
    notes: z.string().optional(),
})

export const progressPhotoSchema = z.object({
    date: z.string().min(1, "Tanggal wajib diisi"),
    notes: z.string().optional(),
})

export const exerciseSchema = z.object({
    name: z.string().min(1, "Nama exercise wajib diisi"),
    sets: z
        .number({ message: "Wajib diisi" })
        .int()
        .min(1, "Minimal 1 set"),
    reps: z
        .number({ message: "Wajib diisi" })
        .int()
        .min(1, "Minimal 1 rep"),
    weight: z
        .number({ message: "Wajib diisi" })
        .min(0, "Tidak boleh negatif"),
    notes: z.string().optional(),
})

export const workoutSchema = z.object({
    date: z.string().min(1, "Tanggal wajib diisi"),
    program: z.string().min(1, "Program wajib diisi"),
    duration: z
        .number({ message: "Durasi wajib diisi" })
        .int()
        .min(1, "Minimal 1 menit")
        .or(z.literal(NaN).transform(() => 0)),
    notes: z.string().optional(),
    exercises: z
        .array(exerciseSchema)
        .min(1, "Tambahkan minimal 1 exercise"),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type MembershipInput = z.infer<typeof membershipSchema>
export type BookingInput = z.infer<typeof bookingSchema>
export const trainerSchema = z.object({
    name: z.string().min(2, "Nama minimal 2 karakter"),
    specialtiesInput: z.string().min(1, "Minimal 1 spesialisasi"),
    description: z.string().optional(),
    pricePerSession: z
        .number({ message: "Harga wajib diisi" })
        .min(1, "Harga harus lebih dari 0"),
})

export const bookPtSchema = z.object({
    date: z.string().min(1, "Tanggal wajib diisi"),
    time: z.string().min(1, "Waktu wajib diisi"),
    notes: z.string().optional(),
})

export const ptSessionAdminSchema = z.object({
    trainerId: z.string().min(1, "Pilih trainer"),
    clientId: z.string().min(1, "Pilih member"),
    date: z.string().min(1, "Tanggal wajib diisi"),
    time: z.string().min(1, "Waktu wajib diisi"),
    durationMinutes: z
        .number({ message: "Durasi wajib diisi" })
        .min(30, "Minimal 30 menit"),
    price: z
        .number({ message: "Harga wajib diisi" })
        .min(1, "Harga harus lebih dari 0"),
    notes: z.string().optional(),
})

export const maintenanceSchema = z.object({
    equipmentName: z.string().min(1, "Nama alat wajib diisi"),
    location: z.string().optional(),
    scheduledDate: z.string().min(1, "Tanggal wajib diisi"),
    notes: z.string().optional(),
})

export type CheckinInput = z.infer<typeof checkinSchema>
export type ProfileInput = z.infer<typeof profileSchema>
export type MeasurementInput = z.infer<typeof measurementSchema>
export type ProgressPhotoInput = z.infer<typeof progressPhotoSchema>
export type ExerciseInput = z.infer<typeof exerciseSchema>
export type WorkoutInput = z.infer<typeof workoutSchema>
export type TrainerInput = z.infer<typeof trainerSchema>
export type BookPtInput = z.infer<typeof bookPtSchema>
export type PtSessionAdminInput = z.infer<typeof ptSessionAdminSchema>
export type MaintenanceInput = z.infer<typeof maintenanceSchema>
