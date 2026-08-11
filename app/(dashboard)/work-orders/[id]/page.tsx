import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAnyRole } from "@/lib/permissions/server";
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
            <main className="p-6">
                <section className="mx-auto max-w-5xl rounded-xl bg-white p-6 shadow-sm">
                    <h1 className="text-2xl font-semibold text-slate-900">
                        Unable to load Work Order
                    </h1>

                    <p className="mt-2 text-slate-600">
                        {result.error ?? "The Work Order could not be loaded."}
                    </p>

                    <Link
                        href="/work-orders"
                        className="inline-flex rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                        Back to Work Orders
                    </Link>
                </section>
            </main>
        );
    }

    const workOrder = result.workOrder;

    return (
        <main className="p-6">
            <section className="mx-auto max-w-5xl rounded-xl bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <Link
                            href="/work-orders"
                            className="inline-block text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                            &larr; Back to Work Orders
                        </Link>

                        <h1 className="mt-3 text-2xl font-semibold text-slate-900">
                            {workOrder.title}
                        </h1>

                        <p className="mt-2 max-w-3xl whitespace-pre-wrap text-slate-700">
                            {workOrder.description}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <span
                            className={`rounded-full px-3 py-1 text-sm font-medium ${
                                statusStyles[workOrder.status]
                            }`}
                        >
                            {statusLabels[workOrder.status]}
                        </span>

                        <span
                            className={`rounded-full px-3 py-1 text-sm font-medium ${
                                priorityStyles[workOrder.priority]
                            }`}
                        >
                            {priorityLabels[workOrder.priority]}
                        </span>

                        <Link
                            href={`/work-orders/${workOrder.id}/edit`}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            Edit Work Order
                        </Link>
                    </div>
                </div>

                <div className="mt-8 grid gap-6 lg:grid-cols-2">
                    <section className="rounded-lg border border-slate-200 p-5">
                        <h2 className="text-lg font-semibold text-slate-900">
                            Customer
                        </h2>

                        <Link
                            href={`/customers/${workOrder.customer.id}`}
                            className="mt-2 inline-block font-medium text-blue-600 hover:underline"
                        >
                            {workOrder.customer.name}
                        </Link>

                        <address className="mt-3 not-italic text-sm leading-6 text-slate-700">
                            <p>{workOrder.customer.addressLine1}</p>

                            {workOrder.customer.addressLine2 ? (
                                <p>{workOrder.customer.addressLine2}</p>
                            ) : null}

                            <p>
                                {workOrder.customer.city}, {workOrder.customer.postcode}
                            </p>
                        </address>

                        <dl className="mt-4 space-y-3">
                            <DetailRow
                                label="Email"
                                value={displayOptionalValue(workOrder.customer.email)}
                            />

                            <DetailRow
                                label="Phone"
                                value={displayOptionalValue(workOrder.customer.phone)}
                            />
                        </dl>
                    </section>

                    <section className="rounded-lg border border-slate-200 p-5">
                        <h2 className="text-lg font-semibold text-slate-900">
                            Technician assignment
                        </h2>

                        {workOrder.technician ? (
                            <>
                                <Link
                                    href={`/technicians/${workOrder.technician.id}`}
                                    className="mt-2 inline-block font-medium text-blue-600 hover:underline"
                                >
                                    {workOrder.technician.user.name}
                                </Link>

                                <p className="mt-1 text-sm text-slate-600">
                                    {workOrder.technician.user.email}
                                </p>

                                <p className="mt-3 text-sm text-slate-700">
                                    Availability:{" "}
                                    <span className="font-medium">
                                        {workOrder.technician.availability}
                                    </span>
                                </p>

                                <div className="mt-4">
                                    <p className="text-sm font-medium text-slate-700">
                                        Skills
                                    </p>

                                    {workOrder.technician.skills.length > 0 ? (
                                        <ul className="mt-2 flex flex-wrap gap-2">
                                            {workOrder.technician.skills.map((skill) => (
                                                <li
                                                    key={skill.toLowerCase()}
                                                    className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-800"
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

                                <p className="mt-1 text-sm text-slate-600">
                                    Edit the Work Order to assign an available Technician.
                                </p>
                            </div>
                        )}
                    </section>
                </div>

                <section className="mt-8 rounded-lg border border-slate-200 p-5">
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

                <section className="mt-8 rounded-lg border border-slate-200 p-5">
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

                            <p className="mt-2 whitespace-pre-wrap text-slate-800">
                                {workOrder.completionNotes}
                            </p>
                        </div>
                    ) : null}
                </section>

                <section className="mt-8">
                    <h2 className="text-lg font-semibold text-slate-900">
                        Activity history
                    </h2>

                    {workOrder.updates.length > 0 ? (
                        <ol className="mt-4 space-y-4">
                            {workOrder.updates.map((update) => (
                                <li
                                    key={update.id}
                                    className="rounded-lg border border-slate-200 p-4"
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <p className="font-medium text-slate-900">
                                                {update.previousStatus
                                                    ? `${statusLabels[update.previousStatus]} to ${
                                                          statusLabels[update.newStatus]
                                                      }`
                                                    : `Created as ${
                                                          statusLabels[update.newStatus]
                                                      }`}
                                            </p>

                                            <p className="mt-1 text-sm text-slate-600">
                                                By {update.author.name} ({update.author.role})
                                            </p>
                                        </div>

                                        <time
                                            dateTime={update.createdAt.toISOString()}
                                            className="text-sm text-slate-500"
                                        >
                                            {formatDate(update.createdAt)}
                                        </time>
                                    </div>

                                    {update.note ? (
                                        <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">
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
            </section>
        </main>
    );
}

type DetailRowProps = {
    label: string;
    value: string;
};

function DetailRow({ label, value }: DetailRowProps) {
    return (
        <div>
            <dt className="text-sm font-medium text-slate-500">{label}</dt>
            <dd className="mt-1 break-words text-slate-900">{value}</dd>
        </div>
    );
}