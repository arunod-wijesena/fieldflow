import { requireAnyRole } from "@/lib/permissions/server";

export default async function TechniciansPage() {
    await requireAnyRole(["ADMIN", "DISPATCHER"]);

    return (
        <main className="p-6">
            <h1 className="text-2xl font-semibold">Technicians</h1>
            <p className="mt-2 text-gray-600">
                Technician management will be implemented in Week 3.
            </p>
        </main>
    );
}