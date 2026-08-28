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

type NavigationLink = {
    href: string;
    label: string;
};

const operationalLinks: readonly NavigationLink[] = [
    {
        href: "/dashboard",
        label: "Dashboard",
    },
    {
        href: "/customers",
        label: "Customers",
    },
    {
        href: "/technicians",
        label: "Technicians",
    },
    {
        href: "/work-orders",
        label: "Work Orders",
    },
];

const technicianLinks: readonly NavigationLink[] = [
    {
        href: "/my-jobs",
        label: "My Jobs",
    },
];

export default async function DashboardLayout({
    children,
}: DashboardLayoutProps) {
    const session = await requireSession();
    const role = session.user.role as UserRole;

    const navigationLinks =
        role === "TECHNICIAN"
            ? technicianLinks
            : operationalLinks;

    return (
        <div className="min-h-screen min-w-0 bg-slate-100">
            <header className="border-b border-slate-200 bg-white shadow-sm">
                <div className="mx-auto max-w-7xl px-4 sm:px-6">
                    <div className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                            <Link
                                href="/dashboard"
                                className="text-xl font-bold tracking-tight text-slate-900 transition-colors hover:text-slate-700"
                            >
                                FieldFlow
                            </Link>

                            <p className="mt-1 truncate text-sm text-slate-600">
                                Signed in as{" "}
                                <span className="font-medium text-slate-800">
                                    {session.user.name}
                                </span>
                            </p>

                            <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-slate-500">
                                {formatRole(role)}
                            </p>
                        </div>

                        <div className="shrink-0">
                            <SignOutButton />
                        </div>
                    </div>

                    <nav
                        className="border-t border-slate-100 py-3"
                        aria-label="Main navigation"
                    >
                        <ul className="flex flex-wrap gap-2">
                            {navigationLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
            </header>

            <div className="min-w-0">{children}</div>
        </div>
    );
}

function formatRole(role: UserRole) {
    if (role === "ADMIN") {
        return "Administrator";
    }

    if (role === "DISPATCHER") {
        return "Dispatcher";
    }

    return "Technician";
}