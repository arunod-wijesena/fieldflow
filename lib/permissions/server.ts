import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";

export const USER_ROLES = [
    "ADMIN",
    "DISPATCHER",
    "TECHNICIAN",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export async function requireSession() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/login");
    }

    return session;
}

export async function requireRole(requiredRole: UserRole) {
    const session = await requireSession();

    if (session.user.role !== requiredRole) {
        redirect("/unauthorized");
    }

    return session;
}

export async function requireAnyRole(allowedRoles: readonly UserRole[]) {
    const session = await requireSession();

    if (!allowedRoles.includes(session.user.role as UserRole)) {
        redirect("/unauthorized");
    }

    return session;
}