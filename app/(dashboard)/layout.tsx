import type { ReactNode } from "react";
import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";
import {
    requireSession,
    type UserRole,
} from "@/lib/permissions/server";

type DashboardLayoutProps = {
    children: ReactNode;
};

export default async function DashboardLayout({
    children,
}: DashboardLayoutProps) {
    const session = await requireSession();
    const role = session.user.role as UserRole;

    const canManageOperations =
        role === "ADMIN" || role === "DISPATCHER";

    return (
        <div className="min-h-screen bg-slate-100">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
                    <div>
                        <Link href="/post-login" className="text-xl font-bold text-slate-900">
                            FieldFlow
                        </Link>

                        <p className="mt-1 text-sm text-slate-600">
                            Signed in as {session.user.name} ({role})
                        </p>
                    </div>

                    <SignOutButton />
                </div>

                <nav
                    className="mx-auto flex max-w-7xl flex-wrap gap-2 px-6 pb-4"
                    aria-label="Main navigation"
                >
                    {canManageOperations ? (
                        <>
                            <Link href="/dashboard" className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-slate-900">
                                Dashboard
                            </Link>

                            <Link href="/customers" className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-slate-900">
                                Customers
                            </Link>

                            <Link href="/technicians" className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-slate-900">
                                Technicians
                            </Link>

                            <Link href="/work-orders" className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-slate-900">
                                Work Orders
                            </Link>
                        </>
                    ) : null}

                    {role === "TECHNICIAN" ? (
                        <Link href="/my-jobs" className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-slate-900">
                            My Jobs
                        </Link>
                    ) : null}
                </nav>
            </header>

            {children}
        </div>
    );
}