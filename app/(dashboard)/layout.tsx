import type { ReactNode } from "react";
import { requireSession } from "@/lib/permissions/server";

type DashboardLayoutProps = {
    children: ReactNode;
};

export default async function DashboardLayout({
    children,
}: DashboardLayoutProps) {
    await requireSession();

    return children;
}