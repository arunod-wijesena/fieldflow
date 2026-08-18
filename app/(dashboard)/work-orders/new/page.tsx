import Link from "next/link";
import { WorkOrderForm } from "@/components/forms/work-order-form";
import { requireAnyRole } from "@/lib/permissions/server";
import { createWorkOrder } from "@/lib/work-orders/actions";
import {
    listAssignableTechnicians,
    listWorkOrderCustomers,
} from "@/lib/work-orders/queries";

export default async function NewWorkOrderPage() {
    await requireAnyRole(["ADMIN", "DISPATCHER"]);

    const [customerResult, technicianResult] = await Promise.all([
        listWorkOrderCustomers(),
        listAssignableTechnicians(),
    ]);

    const hasError = Boolean(
        customerResult.error || technicianResult.error,
    );

    return (
        <main className="p-6">
            <section className="mx-auto max-w-4xl rounded-xl bg-white p-6 shadow-sm">
                <div className="mb-6">
                    <Link
                        href="/work-orders"
                        className="text-sm font-medium text-blue-700 hover:text-blue-800"
                    >
                        Back to Work Orders
                    </Link>

                    <h1 className="mt-3 text-2xl font-semibold text-slate-900">
                        Create Work Order
                    </h1>

                    <p className="mt-2 text-sm text-slate-600">
                        Select a Customer, define the service work, and optionally assign
                        a Technician and schedule.
                    </p>
                </div>

                {customerResult.error ? (
                    <LoadError message={customerResult.error} />
                ) : null}

                {technicianResult.error ? (
                    <LoadError message={technicianResult.error} />
                ) : null}

                {!hasError && customerResult.customers.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center">
                        <h2 className="text-lg font-semibold text-slate-900">
                            A Customer is required
                        </h2>

                        <p className="mt-2 text-sm text-slate-600">
                            Create a Customer before creating a Work Order.
                        </p>

                        <Link
                            href="/customers/new"
                            className="mt-4 inline-block rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
                        >
                            Add Customer
                        </Link>
                    </div>
                ) : null}

                {!hasError && customerResult.customers.length > 0 ? (
                    <WorkOrderForm
                        action={createWorkOrder}
                        customers={customerResult.customers}
                        technicians={technicianResult.technicians}
                        submitLabel="Create Work Order"
                    />
                ) : null}
            </section>
        </main>
    );
}

type LoadErrorProps = {
    message: string;
};

function LoadError({ message }: LoadErrorProps) {
    return (
        <div
            className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-800"
            role="alert"
        >
            {message}
        </div>
    );
}