import Link from "next/link";
import { notFound } from "next/navigation";
import { WorkOrderForm } from "@/components/forms/work-order-form";
import { requireAnyRole } from "@/lib/permissions/server";
import { updateWorkOrder } from "@/lib/work-orders/actions";
import { toDateTimeLocalValue } from "@/lib/work-orders/date-time";
import {
    getWorkOrderById,
    listAssignableTechnicians,
    listWorkOrderCustomers,
} from "@/lib/work-orders/queries";

type EditWorkOrderPageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function EditWorkOrderPage({
    params,
}: EditWorkOrderPageProps) {
    await requireAnyRole(["ADMIN", "DISPATCHER"]);

    const { id } = await params;

    const [workOrderResult, customerResult, technicianResult] =
        await Promise.all([
            getWorkOrderById(id),
            listWorkOrderCustomers(),
            listAssignableTechnicians(),
        ]);

    if (!workOrderResult.workOrder) {
        if (
            workOrderResult.error === "Work Order not found." ||
            workOrderResult.error === "Invalid Work Order identifier."
        ) {
            notFound();
        }

        return (
            <main className="p-6">
                <section className="mx-auto max-w-4xl rounded-xl bg-white p-6 shadow-sm">
                    <h1 className="text-2xl font-semibold text-slate-900">
                        Unable to load Work Order
                    </h1>

                    <p className="mt-2 text-slate-600">
                        {workOrderResult.error ??
                            "The Work Order could not be loaded."}
                    </p>

                    <Link
                        href="/work-orders"
                        className="mt-4 inline-block text-sm font-medium text-blue-700 hover:text-blue-800"
                    >
                        Back to Work Orders
                    </Link>
                </section>
            </main>
        );
    }

    const workOrder = workOrderResult.workOrder;

    if (
        workOrder.status === "IN_PROGRESS" ||
        workOrder.status === "COMPLETED" ||
        workOrder.status === "CANCELLED"
    ) {
        return (
            <main className="p-6">
                <section className="mx-auto max-w-4xl rounded-xl bg-white p-6 shadow-sm">
                    <h1 className="text-2xl font-semibold text-slate-900">
                        Work Order cannot be edited
                    </h1>

                    <p className="mt-2 text-slate-600">
                        In-progress, completed, and cancelled Work Orders cannot be
                        changed through the general editing form.
                    </p>

                    <Link
                        href={`/work-orders/${workOrder.id}`}
                        className="mt-4 inline-block text-sm font-medium text-blue-700 hover:text-blue-800"
                    >
                        Back to Work Order
                    </Link>
                </section>
            </main>
        );
    }

    if (customerResult.error || technicianResult.error) {
        return (
            <main className="p-6">
                <section className="mx-auto max-w-4xl rounded-xl bg-white p-6 shadow-sm">
                    <h1 className="text-2xl font-semibold text-slate-900">
                        Unable to edit Work Order
                    </h1>

                    <p className="mt-2 text-slate-600">
                        {customerResult.error ??
                            technicianResult.error ??
                            "The editing options could not be loaded."}
                    </p>

                    <Link
                        href={`/work-orders/${workOrder.id}`}
                        className="mt-4 inline-block text-sm font-medium text-blue-700 hover:text-blue-800"
                    >
                        Back to Work Order
                    </Link>
                </section>
            </main>
        );
    }

    const technicianOptions = [...technicianResult.technicians];

    if (
        workOrder.technician &&
        !technicianOptions.some(
            (technician) => technician.id === workOrder.technician?.id,
        )
    ) {
        technicianOptions.push({
            id: workOrder.technician.id,
            skills: workOrder.technician.skills,
            availability: workOrder.technician.availability,
            user: {
                name: workOrder.technician.user.name,
                email: workOrder.technician.user.email,
                role: workOrder.technician.user.role,
            },
            _count: {
                workOrders: 0,
            },
        });
    }

    const updateWorkOrderWithId = updateWorkOrder.bind(
        null,
        workOrder.id,
    );

    return (
        <main className="p-6">
            <section className="mx-auto max-w-4xl rounded-xl bg-white p-6 shadow-sm">
                <div className="mb-6">
                    <Link
                        href={`/work-orders/${workOrder.id}`}
                        className="text-sm font-medium text-blue-700 hover:text-blue-800"
                    >
                        Back to Work Order
                    </Link>

                    <h1 className="mt-3 text-2xl font-semibold text-slate-900">
                        Edit Work Order
                    </h1>

                    <p className="mt-2 text-sm text-slate-600">
                        Update service details, scheduling, and Technician assignment.
                    </p>
                </div>

                <WorkOrderForm
                    action={updateWorkOrderWithId}
                    customers={customerResult.customers}
                    technicians={technicianOptions}
                    submitLabel="Save Changes"
                    defaultValues={{
                        title: workOrder.title,
                        description: workOrder.description,
                        priority: workOrder.priority,
                        customerId: workOrder.customerId,
                        technicianId: workOrder.technicianId,
                        scheduledStart: toDateTimeLocalValue(
                            workOrder.scheduledStart,
                        ),
                        scheduledEnd: toDateTimeLocalValue(
                            workOrder.scheduledEnd,
                        ),
                    }}
                />
            </section>
        </main>
    );
}