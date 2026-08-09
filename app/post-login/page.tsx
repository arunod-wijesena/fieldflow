import { redirect } from "next/navigation";
import { requireSession } from "@/lib/permissions/server";
import type { UserRole } from "@/lib/permissions/server";

export default async function PostLoginPage() {
    const session = await requireSession();
    const role = session.user.role as UserRole;

    switch (role) {
        case "ADMIN":
        case "DISPATCHER":
            redirect("/dashboard");

        case "TECHNICIAN":
            redirect("/my-jobs");

        default:
            redirect("/unauthorized");
    }
}