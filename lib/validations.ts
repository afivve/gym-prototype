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

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type MembershipInput = z.infer<typeof membershipSchema>
export type BookingInput = z.infer<typeof bookingSchema>
export type CheckinInput = z.infer<typeof checkinSchema>
