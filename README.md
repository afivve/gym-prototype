# GymPro - Sistem Manajemen Gym Modern

Prototype sistem manajemen gym dengan Next.js App Router, Tailwind CSS, shadcn/ui, React Hook Form + Zod, dan mock data in-memory.

---

## Cara Menjalankan

### 1. Install Dependencies

```bash
npm install @radix-ui/react-avatar @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-label @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-slot @hookform/resolvers class-variance-authority clsx lucide-react qrcode.react react-hook-form sonner tailwind-merge zod
```

### 2. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

---

## Demo Credentials

| Role   | Email                        | Password   |
|--------|------------------------------|------------|
| Admin  | admin@gymprototype.com       | admin123   |
| Member | member@gymprototype.com      | member123  |

> Data disimpan di `localStorage` sehingga tidak hilang saat refresh.  
> Untuk reset data, hapus localStorage di browser (DevTools > Application > Local Storage > Clear All).

---

## Struktur Project

```
gym-prototype/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx          # Halaman login
│   │   └── register/page.tsx       # Halaman registrasi
│   ├── (member)/
│   │   ├── layout.tsx              # Layout member (protected)
│   │   ├── dashboard/page.tsx      # Dashboard member
│   │   ├── membership/page.tsx     # Pilih & aktivasi paket
│   │   ├── checkin/page.tsx        # QR code check-in
│   │   └── classes/page.tsx        # Booking kelas
│   ├── admin/
│   │   ├── layout.tsx              # Layout admin (protected)
│   │   ├── page.tsx                # Dashboard admin
│   │   ├── members/page.tsx        # Kelola member & approve payment
│   │   ├── checkins/page.tsx       # Log check-in & manual scan
│   │   └── bookings/page.tsx       # Monitor booking kelas
│   ├── globals.css                 # Tailwind v4 + CSS variables (shadcn theme)
│   ├── layout.tsx                  # Root layout dengan providers + Toaster
│   └── page.tsx                    # Redirect berdasarkan role
├── components/
│   ├── ui/                         # shadcn/ui components
│   │   ├── button.tsx, card.tsx, input.tsx, label.tsx
│   │   ├── badge.tsx, table.tsx, dialog.tsx, form.tsx
│   │   ├── select.tsx, separator.tsx, sonner.tsx
│   │   ├── avatar.tsx, dropdown-menu.tsx
│   └── layout/
│       ├── member-sidebar.tsx      # Sidebar navigasi member (responsive)
│       └── admin-sidebar.tsx       # Sidebar navigasi admin (responsive)
├── contexts/
│   ├── auth-context.tsx            # Auth state + login/logout/register
│   └── app-context.tsx             # App-wide state (members, classes, bookings, checkins)
└── lib/
    ├── utils.ts                    # cn(), formatCurrency, formatDate, generateId
    ├── validations.ts              # Zod schemas (register, login, booking, checkin)
    └── mock/
        ├── users.ts                # Mock users data + User type
        ├── memberships.ts          # Mock memberships + MEMBERSHIP_PLANS config
        ├── classes.ts              # Mock gym classes + GymClass type
        ├── bookings.ts             # Mock bookings + Booking type
        └── checkins.ts             # Mock check-in logs + CheckIn type
```

---

## Alur Fitur

### Member
1. **Register** `/register` — Daftar akun baru → auto-login → redirect `/dashboard`
2. **Login** `/login` — Masuk → redirect `/dashboard` atau `/admin`
3. **Dashboard** `/dashboard` — Statistik, status membership, riwayat check-in, booking aktif
4. **Membership** `/membership` — Pilih paket Mingguan/Bulanan → bayar → status `pending`
5. **QR Check-in** `/checkin` — QR code unik + tombol simulasi check-in mandiri
6. **Booking Kelas** `/classes` — List kelas dengan kuota real-time, book/batal

### Admin
1. **Dashboard** `/admin` — Ringkasan statistik, alert pending, check-in terbaru
2. **Data Member** `/admin/members` — List member, status membership, tombol **Approve**
3. **Log Check-in** `/admin/checkins` — Riwayat + form manual check-in via email
4. **Booking Kelas** `/admin/bookings` — Monitor semua booking + kuota per kelas

---

## Mock Data (Contoh)

### Membership Plans
```typescript
weekly:  { price: 75.000,  durationDays: 7,  features: [...] }
monthly: { price: 250.000, durationDays: 30, features: [...] }
```

### Gym Classes (6 kelas)
- Yoga Morning — Sen/Rab/Jum 07:00 (kuota 15)
- Zumba Party — Sel/Kam 17:00 (kuota 20)
- Personal Training — Setiap hari 08:00 (kuota 1)
- HIIT Power — Sen/Sel/Kam 06:00 (kuota 12)
- Pilates Core — Rab/Jum 16:00 (kuota 10)
- Kickboxing Fit — Sel/Sab 19:00 (kuota 15)

---

## Upgrade ke Backend Real

Untuk upgrade ke Prisma + PostgreSQL nantinya:

1. `npm install prisma @prisma/client && npx prisma init`
2. Buat `prisma/schema.prisma` mengikuti interface di `lib/mock/*.ts`
3. Ganti fungsi di `contexts/app-context.tsx` dengan fetch ke Route Handlers (`app/api/`)
4. Implementasi NextAuth.js untuk session JWT
5. Hapus localStorage persistence, gunakan server-side session

---

## Tech Stack

| Teknologi | Kegunaan |
|-----------|----------|
| Next.js 16 (App Router) | Framework + routing |
| React 19 | UI |
| TypeScript 5 | Type safety |
| Tailwind CSS 4 | Styling |
| shadcn/ui | UI components |
| Radix UI | Accessible primitives |
| React Hook Form + Zod | Form + validasi |
| qrcode.react | Generate QR code |
| Sonner | Toast notifications |
| Lucide React | Icons |
| localStorage | Data persistence (mock) |
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
