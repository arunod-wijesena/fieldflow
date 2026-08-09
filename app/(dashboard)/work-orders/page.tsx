import { requireAnyRole } from "@/lib/permissions/server";

export default async function WorkOrdersPage() {
    await requireAnyRole(["ADMIN", "DISPATCHER"]);

    return (
        <main className="p-6">
            <h1 className="text-2xl font-semibold">Work Orders</h1>
            <p className="mt-2 text-gray-600">
                Work-order management will be implemented in Week 4.
            </p>
        </main>
    );
}