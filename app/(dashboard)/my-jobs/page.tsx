import { requireRole } from "@/lib/permissions/server";

export default async function MyJobsPage() {
    await requireRole("TECHNICIAN");

    return (
        <main className="p-6">
            <h1 className="text-2xl font-semibold">My Jobs</h1>
            <p className="mt-2 text-gray-600">
                The technician workflow will be implemented in Week 5.
            </p>
        </main>
    );
}