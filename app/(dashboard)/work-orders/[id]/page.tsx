import Link from "next/link";
import { notFound } from "next/navigation";
import { WorkOrderCancelForm } from "@/components/forms/work-order-cancel-form";
import { requireAnyRole } from "@/lib/permissions/server";
import { cancelWorkOrder } from "@/lib/work-orders/actions";
import { getWorkOrderById } from "@/lib/work-orders/queries";

type WorkOrderDetailsPageProps = {
    params: Promise<{
        id: string;
    }>;
};

const statusLabels = {
    UNASSIGNED: "Unassigned",
    ASSIGNED: "Assigned",
    IN_PROGRESS: "In progress",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
} as const;

const statusStyles = {
    UNASSIGNED: "bg-slate-200 text-slate-800",
    ASSIGNED: "bg-blue-100 text-blue-800",
    IN_PROGRESS: "bg-amber-100 text-amber-800",
    COMPLETED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
} as const;

const priorityLabels = {
    LOW: "Low",
    MEDIUM: "Medium",
    HIGH: "High",
    URGENT: "Urgent",
} as const;

const priorityStyles = {
    LOW: "bg-slate-100 text-slate-700",
    MEDIUM: "bg-blue-50 text-blue-800",
    HIGH: "bg-orange-100 text-orange-800",
    URGENT: "bg-red-100 text-red-800",
} as const;

function formatDate(value: Date) {
    return new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "UTC",
    }).format(value);
}

function displayOptionalValue(value: string | null) {
    return value ?? "Not provided";
}

export default async function WorkOrderDetailsPage({
    params,
}: WorkOrderDetailsPageProps) {
    await requireAnyRole(["ADMIN", "DISPATCHER"]);

    const { id } = await params;
    const result = await getWorkOrderById(id);

    if (!result.workOrder) {
        if (
            result.error === "Work Order not found." ||
            result.error === "Invalid Work Order identifier."
        ) {
            notFound();
        }

        return (
            <main className="min-w-0 p-4 sm:p-6">
                <section className="mx-auto max-w-5xl rounded-xl bg-white p-4 shadow-sm sm:p-6">
                    <h1 className="text-2xl font-semibold text-slate-900">
                        Unable to load Work Order
                    </h1>

                    <p className="mt-2 break-words text-slate-600">
                        {result.error ?? "The Work Order could not be loaded."}
                    </p>

                    <Link
                        href="/work-orders"
                        className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900"
                    >
                        <span aria-hidden="true">←</span>
                        <span className="ml-1">Back to Work Orders</span>
                    </Link>
                </section>
            </main>
        );
    }

    const workOrder = result.workOrder;

    const canCancel =
        workOrder.status === "UNASSIGNED" ||
        workOrder.status === "ASSIGNED";

    const canEdit =
        workOrder.status === "UNASSIGNED" ||
        workOrder.status === "ASSIGNED";

    const cancelWorkOrderWithId = cancelWorkOrder.bind(
        null,
        workOrder.id,
    );

    return (
        <main className="min-w-0 p-4 sm:p-6">
            <section className="mx-auto max-w-5xl rounded-xl bg-white p-4 shadow-sm sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                        <Link
                            href="/work-orders"
                            className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900"
                        >
                            <span aria-hidden="true">←</span>
                            <span className="ml-1">Back to Work Orders</span>
                        </Link>

                        <h1 className="mt-3 break-words text-2xl font-semibold text-slate-900">
                            {workOrder.title}
                        </h1>

                        <p className="mt-2 max-w-3xl whitespace-pre-wrap break-words text-slate-700">
                            {workOrder.description}
                        </p>
                    </div>

                    <div className="flex w-full flex-col gap-3 sm:w-auto sm:items-end">
                        <div className="flex flex-wrap gap-2">
                            <span
                                className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${statusStyles[workOrder.status]
                                    }`}
                            >
                                {statusLabels[workOrder.status]}
                            </span>

                            <span
                                className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${priorityStyles[workOrder.priority]
                                    }`}
                            >
                                {priorityLabels[workOrder.priority]}
                            </span>
                        </div>

                        {canEdit ? (
                            <Link
                                href={`/work-orders/${workOrder.id}/edit`}
                                className="inline-flex min-h-11 items-center justify-center rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:w-auto"
                            >
                                Edit Work Order
                            </Link>
                        ) : null}
                    </div>
                </div>

                <div className="mt-8 grid gap-6 lg:grid-cols-2">
                    <section className="min-w-0 rounded-lg border border-slate-200 p-4 sm:p-5">
                        <h2 className="text-lg font-semibold text-slate-900">
                            Customer
                        </h2>

                        <Link
                            href={`/customers/${workOrder.customer.id}`}
                            className="mt-2 inline-block font-medium text-blue-700 hover:underline"
                        >
                            {workOrder.customer.name}
                        </Link>

                        <address className="mt-3 break-words not-italic text-sm leading-6 text-slate-700">
                            <p>{workOrder.customer.addressLine1}</p>

                            {workOrder.customer.addressLine2 ? (
                                <p>{workOrder.customer.addressLine2}</p>
                            ) : null}

                            <p>
                                {workOrder.customer.city},{" "}
                                {workOrder.customer.postcode}
                            </p>
                        </address>

                        <dl className="mt-4 space-y-3">
                            <DetailRow
                                label="Email"
                                value={displayOptionalValue(workOrder.customer.email)}
                                breakAll
                            />

                            <DetailRow
                                label="Phone"
                                value={displayOptionalValue(workOrder.customer.phone)}
                            />
                        </dl>
                    </section>

                    <section className="min-w-0 rounded-lg border border-slate-200 p-4 sm:p-5">
                        <h2 className="text-lg font-semibold text-slate-900">
                            Technician assignment
                        </h2>

                        {workOrder.technician ? (
                            <>
                                <Link
                                    href={`/technicians/${workOrder.technician.id}`}
                                    className="mt-2 inline-block font-medium text-blue-700 hover:underline"
                                >
                                    {workOrder.technician.user.name}
                                </Link>

                                <p className="mt-1 break-all text-sm text-slate-600">
                                    {workOrder.technician.user.email}
                                </p>

                                <p className="mt-3 text-sm text-slate-700">
                                    Availability:{" "}
                                    <span className="font-medium">
                                        {workOrder.technician.availability}
                                    </span>
                                </p>

                                <div className="mt-4 min-w-0">
                                    <p className="text-sm font-medium text-slate-700">
                                        Skills
                                    </p>

                                    {workOrder.technician.skills.length > 0 ? (
                                        <ul className="mt-2 flex min-w-0 flex-wrap gap-2">
                                            {workOrder.technician.skills.map((skill) => (
                                                <li
                                                    key={skill.toLowerCase()}
                                                    className="max-w-full break-words rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-800"
                                                >
                                                    {skill}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="mt-1 text-sm text-slate-500">
                                            No skills recorded.
                                        </p>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="mt-3 rounded-md bg-slate-50 p-4">
                                <p className="font-medium text-slate-900">
                                    No Technician assigned
                                </p>

                                <p className="mt-1 break-words text-sm text-slate-600">
                                    Edit the Work Order to assign an available Technician.
                                </p>
                            </div>
                        )}
                    </section>
                </div>

                <section className="mt-8 rounded-lg border border-slate-200 p-4 sm:p-5">
                    <h2 className="text-lg font-semibold text-slate-900">
                        Schedule
                    </h2>

                    <dl className="mt-4 grid gap-5 sm:grid-cols-2">
                        <DetailRow
                            label="Scheduled start"
                            value={
                                workOrder.scheduledStart
                                    ? formatDate(workOrder.scheduledStart)
                                    : "Not scheduled"
                            }
                        />

                        <DetailRow
                            label="Scheduled end"
                            value={
                                workOrder.scheduledEnd
                                    ? formatDate(workOrder.scheduledEnd)
                                    : "Not scheduled"
                            }
                        />
                    </dl>
                </section>

                <section className="mt-8 rounded-lg border border-slate-200 p-4 sm:p-5">
                    <h2 className="text-lg font-semibold text-slate-900">
                        Work Order information
                    </h2>

                    <dl className="mt-4 grid gap-5 sm:grid-cols-2">
                        <DetailRow
                            label="Created by"
                            value={`${workOrder.createdBy.name} (${workOrder.createdBy.role})`}
                        />

                        <DetailRow
                            label="Created"
                            value={formatDate(workOrder.createdAt)}
                        />

                        <DetailRow
                            label="Last updated"
                            value={formatDate(workOrder.updatedAt)}
                        />

                        <DetailRow
                            label="Completed"
                            value={
                                workOrder.completedAt
                                    ? formatDate(workOrder.completedAt)
                                    : "Not completed"
                            }
                        />
                    </dl>

                    {workOrder.completionNotes ? (
                        <div className="mt-5 border-t border-slate-200 pt-5">
                            <h3 className="text-sm font-medium text-slate-500">
                                Completion notes
                            </h3>

                            <p className="mt-2 whitespace-pre-wrap break-words text-slate-800">
                                {workOrder.completionNotes}
                            </p>
                        </div>
                    ) : null}
                </section>

                <section className="mt-8 min-w-0">
                    <h2 className="text-lg font-semibold text-slate-900">
                        Activity history
                    </h2>

                    {workOrder.updates.length > 0 ? (
                        <ol className="mt-4 space-y-4">
                            {workOrder.updates.map((update) => (
                                <li
                                    key={update.id}
                                    className="min-w-0 rounded-lg border border-slate-200 p-4"
                                >
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="min-w-0">
                                            <p className="break-words font-medium text-slate-900">
                                                {update.previousStatus
                                                    ? `${statusLabels[update.previousStatus]} to ${statusLabels[update.newStatus]
                                                    }`
                                                    : `Created as ${statusLabels[update.newStatus]
                                                    }`}
                                            </p>

                                            <p className="mt-1 break-words text-sm text-slate-600">
                                                By {update.author.name} ({update.author.role})
                                            </p>
                                        </div>

                                        <time
                                            dateTime={update.createdAt.toISOString()}
                                            className="shrink-0 text-sm text-slate-500"
                                        >
                                            {formatDate(update.createdAt)}
                                        </time>
                                    </div>

                                    {update.note ? (
                                        <p className="mt-3 whitespace-pre-wrap break-words text-sm text-slate-700">
                                            {update.note}
                                        </p>
                                    ) : null}
                                </li>
                            ))}
                        </ol>
                    ) : (
                        <div className="mt-4 rounded-lg border border-dashed border-slate-300 p-6 text-center">
                            <p className="text-sm text-slate-600">
                                No Work Order history is available.
                            </p>
                        </div>
                    )}
                </section>

                {canCancel ? (
                    <section className="mt-8 rounded-lg border border-red-200 bg-red-50 p-4 sm:p-5">
                        <h2 className="text-lg font-semibold text-red-900">
                            Cancel Work Order
                        </h2>

                        <p className="mt-2 break-words text-sm text-red-800">
                            Cancelling a Work Order records a status-history entry
                            and prevents normal editing through the Dispatcher form.
                        </p>

                        <div className="mt-4">
                            <WorkOrderCancelForm action={cancelWorkOrderWithId} />
                        </div>
                    </section>
                ) : null}
            </section>
        </main>
    );
}

type DetailRowProps = {
    label: string;
    value: string;
    breakAll?: boolean;
};

function DetailRow({
    label,
    value,
    breakAll = false,
}: DetailRowProps) {
    return (
        <div className="min-w-0">
            <dt className="text-sm font-medium text-slate-500">
                {label}
            </dt>

            <dd
                className={`mt-1 text-slate-900 ${breakAll ? "break-all" : "break-words"
                    }`}
            >
                {value}
            </dd>
        </div>
    );
}