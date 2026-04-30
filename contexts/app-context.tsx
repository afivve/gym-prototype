"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { type User, initialUsers } from "@/lib/mock/users";
import {
  type Membership,
  initialMemberships,
  MEMBERSHIP_PLANS,
} from "@/lib/mock/memberships";
import { type GymClass, initialClasses } from "@/lib/mock/classes";
import { type Booking, initialBookings } from "@/lib/mock/bookings";
import { type CheckIn, initialCheckIns } from "@/lib/mock/checkins";
import { generateId, addDays } from "@/lib/utils";

interface AppContextType {
  // Data
  users: User[];
  memberships: Membership[];
  classes: GymClass[];
  bookings: Booking[];
  checkIns: CheckIn[];

  // Membership actions
  activateMembership: (
    userId: string,
    plan: "weekly" | "monthly",
  ) => { success: boolean; message: string };
  approveMembership: (membershipId: string) => void;
  getUserMembership: (userId: string) => Membership | undefined;

  // Booking actions
  bookClass: (
    userId: string,
    classId: string,
  ) => { success: boolean; message: string };
  cancelBooking: (bookingId: string) => void;
  getUserBookings: (userId: string) => Booking[];

  // Check-in actions
  checkIn: (
    userId: string,
    method: "qr" | "manual",
  ) => { success: boolean; message: string };
  getUserCheckIns: (userId: string) => CheckIn[];
  findUserByEmailOrId: (emailOrId: string) => User | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const KEYS = {
  users: "gym_users",
  memberships: "gym_memberships",
  classes: "gym_classes",
  bookings: "gym_bookings",
  checkIns: "gym_checkins",
};

function loadOrInit<T>(key: string, initial: T[]): T[] {
  if (typeof window === "undefined") return initial;
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      return JSON.parse(stored) as T[];
    } catch {
      return initial;
    }
  }
  localStorage.setItem(key, JSON.stringify(initial));
  return initial;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [users] = useState<User[]>(() => loadOrInit(KEYS.users, initialUsers));
  const [memberships, setMemberships] = useState<Membership[]>(() =>
    loadOrInit(KEYS.memberships, initialMemberships),
  );
  const [classes, setClasses] = useState<GymClass[]>(() =>
    loadOrInit(KEYS.classes, initialClasses),
  );
  const [bookings, setBookings] = useState<Booking[]>(() =>
    loadOrInit(KEYS.bookings, initialBookings),
  );
  const [checkIns, setCheckIns] = useState<CheckIn[]>(() =>
    loadOrInit(KEYS.checkIns, initialCheckIns),
  );

  // Persist helpers
  const persist = useCallback(<T,>(key: string, data: T[]) => {
    if (typeof window !== "undefined")
      localStorage.setItem(key, JSON.stringify(data));
  }, []);

  // Membership
  const getUserMembership = useCallback(
    (userId: string): Membership | undefined => {
      return memberships
        .filter((m) => m.userId === userId)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )[0];
    },
    [memberships],
  );

  const activateMembership = useCallback(
    (
      userId: string,
      plan: "weekly" | "monthly",
    ): { success: boolean; message: string } => {
      const planDetails = MEMBERSHIP_PLANS[plan];
      const now = new Date().toISOString();
      const endDate = addDays(now, planDetails.durationDays);
      const newMembership: Membership = {
        id: generateId("membership"),
        userId,
        plan,
        status: "pending",
        startDate: now,
        endDate,
        price: planDetails.price,
        createdAt: now,
      };
      const updated = [...memberships, newMembership];
      setMemberships(updated);
      persist(KEYS.memberships, updated);
      return {
        success: true,
        message: "Pembayaran berhasil, menunggu konfirmasi admin",
      };
    },
    [memberships, persist],
  );

  const approveMembership = useCallback(
    (membershipId: string) => {
      const updated = memberships.map((m) =>
        m.id === membershipId ? { ...m, status: "active" as const } : m,
      );
      setMemberships(updated);
      persist(KEYS.memberships, updated);
    },
    [memberships, persist],
  );

  // Booking
  const getUserBookings = useCallback(
    (userId: string): Booking[] => {
      return bookings.filter((b) => b.userId === userId);
    },
    [bookings],
  );

  const bookClass = useCallback(
    (
      userId: string,
      classId: string,
    ): { success: boolean; message: string } => {
      const alreadyBooked = bookings.find(
        (b) =>
          b.userId === userId &&
          b.classId === classId &&
          b.status === "confirmed",
      );
      if (alreadyBooked) {
        return { success: false, message: "Anda sudah booking kelas ini" };
      }
      const gymClass = classes.find((c) => c.id === classId);
      if (!gymClass)
        return { success: false, message: "Kelas tidak ditemukan" };
      if (gymClass.bookedCount >= gymClass.quota) {
        return { success: false, message: "Kuota kelas sudah penuh" };
      }

      const newBooking: Booking = {
        id: generateId("booking"),
        userId,
        classId,
        status: "confirmed",
        bookedAt: new Date().toISOString(),
      };
      const updatedBookings = [...bookings, newBooking];
      const updatedClasses = classes.map((c) =>
        c.id === classId ? { ...c, bookedCount: c.bookedCount + 1 } : c,
      );
      setBookings(updatedBookings);
      setClasses(updatedClasses);
      persist(KEYS.bookings, updatedBookings);
      persist(KEYS.classes, updatedClasses);
      return { success: true, message: "Booking berhasil!" };
    },
    [bookings, classes, persist],
  );

  const cancelBooking = useCallback(
    (bookingId: string) => {
      const booking = bookings.find((b) => b.id === bookingId);
      if (!booking) return;
      const updatedBookings = bookings.map((b) =>
        b.id === bookingId ? { ...b, status: "cancelled" as const } : b,
      );
      const updatedClasses = classes.map((c) =>
        c.id === booking.classId
          ? { ...c, bookedCount: Math.max(0, c.bookedCount - 1) }
          : c,
      );
      setBookings(updatedBookings);
      setClasses(updatedClasses);
      persist(KEYS.bookings, updatedBookings);
      persist(KEYS.classes, updatedClasses);
    },
    [bookings, classes, persist],
  );

  // Check-in
  const getUserCheckIns = useCallback(
    (userId: string): CheckIn[] => {
      return checkIns
        .filter((c) => c.userId === userId)
        .sort(
          (a, b) =>
            new Date(b.checkedInAt).getTime() -
            new Date(a.checkedInAt).getTime(),
        );
    },
    [checkIns],
  );

  const findUserByEmailOrId = useCallback(
    (emailOrId: string): User | undefined => {
      return users.find(
        (u) =>
          u.email.toLowerCase() === emailOrId.toLowerCase() ||
          u.id === emailOrId,
      );
    },
    [users],
  );

  const checkIn = useCallback(
    (
      userId: string,
      method: "qr" | "manual",
    ): { success: boolean; message: string } => {
      // Prevent duplicate check-in within 1 hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const recent = checkIns.find(
        (c) => c.userId === userId && c.checkedInAt > oneHourAgo,
      );
      if (recent) {
        return {
          success: false,
          message: "Member sudah check-in dalam 1 jam terakhir",
        };
      }
      const newCheckIn: CheckIn = {
        id: generateId("checkin"),
        userId,
        checkedInAt: new Date().toISOString(),
        method,
      };
      const updated = [...checkIns, newCheckIn];
      setCheckIns(updated);
      persist(KEYS.checkIns, updated);
      return { success: true, message: "Check-in berhasil!" };
    },
    [checkIns, persist],
  );

  return (
    <AppContext.Provider
      value={{
        users,
        memberships,
        classes,
        bookings,
        checkIns,
        activateMembership,
        approveMembership,
        getUserMembership,
        bookClass,
        cancelBooking,
        getUserBookings,
        checkIn,
        getUserCheckIns,
        findUserByEmailOrId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
