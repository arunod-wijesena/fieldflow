import type { ReactNode } from "react";
import Link from "next/link";
import { requireAnyRole } from "@/lib/permissions/server";
import {
    getWorkOrderFilterOptions,
    listWorkOrders,
} from "@/lib/work-orders/queries";
import {
    workOrderPriorityValues,
    workOrderStatusValues,
} from "@/lib/validation/work-order";

type WorkOrdersPageProps = {
    searchParams: Promise<{
        query?: string;
        status?: string;
        priority?: string;
        customerId?: string;
        technicianId?: string;
    }>;
};

const statusLabels = {
    UNASSIGNED: "Unassigned",
    ASSIGNED: "Assigned",
    IN_PROGRESS: "In progress",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
} satisfies Record<(typeof workOrderStatusValues)[number], string>;

const statusStyles = {
    UNASSIGNED: "bg-slate-200 text-slate-800",
    ASSIGNED: "bg-blue-100 text-blue-800",
    IN_PROGRESS: "bg-amber-100 text-amber-800",
    COMPLETED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
} satisfies Record<(typeof workOrderStatusValues)[number], string>;

const priorityLabels = {
    LOW: "Low",
    MEDIUM: "Medium",
    HIGH: "High",
    URGENT: "Urgent",
} satisfies Record<(typeof workOrderPriorityValues)[number], string>;

const priorityStyles = {
    LOW: "bg-slate-100 text-slate-700",
    MEDIUM: "bg-blue-50 text-blue-800",
    HIGH: "bg-orange-100 text-orange-800",
    URGENT: "bg-red-100 text-red-800",
} satisfies Record<(typeof workOrderPriorityValues)[number], string>;

function formatDate(value: Date | null) {
    if (!value) {
        return "Not scheduled";
    }

    return new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "UTC",
    }).format(value);
}

export default async function WorkOrdersPage({
    searchParams,
}: WorkOrdersPageProps) {
    await requireAnyRole(["ADMIN", "DISPATCHER"]);

    const {
        query = "",
        status = "",
        priority = "",
        customerId = "",
        technicianId = "",
    } = await searchParams;

    const [workOrderResult, filterResult] = await Promise.all([
        listWorkOrders(query, status, priority, technicianId, customerId),
        getWorkOrderFilterOptions(),
    ]);

    const hasFilters =
        query || status || priority || customerId || technicianId;

    return (
        <main className="p-6">
            <section className="mx-auto max-w-7xl rounded-xl bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <p className="text-sm font-medium text-blue-700">FieldFlow</p>

                        <h1 className="mt-1 text-2xl font-semibold text-slate-900">
                            Work Orders
                        </h1>

                        <p className="mt-2 text-sm text-slate-600">
                            Search, filter, assign, and review service Work Orders.
                        </p>
                    </div>

                    <Link
                        href="/work-orders/new"
                        className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        Create Work Order
                    </Link>
                </div>

                <form action="/work-orders" method="GET" className="mt-6 flex flex-wrap items-center gap-4">
                    <div>
                        <label className="sr-only" htmlFor="work-order-search">
                            Search Work Orders
                        </label>

                        <input
                            id="work-order-search"
                            name="query"
                            type="search"
                            defaultValue={query}
                            placeholder="Search title, description, customer, or technician"
                            maxLength={100}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    <div>
                        <label className="sr-only" htmlFor="status-filter">
                            Filter by status
                        </label>

                        <select
                            id="status-filter"
                            name="status"
                            defaultValue={status}
                            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                        >
                            <option value="">All statuses</option>

                            {workOrderStatusValues.map((value) => (
                                <option key={value} value={value}>
                                    {statusLabels[value]}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="sr-only" htmlFor="priority-filter">
                            Filter by priority
                        </label>

                        <select
                            id="priority-filter"
                            name="priority"
                            defaultValue={priority}
                            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                        >
                            <option value="">All priorities</option>

                            {workOrderPriorityValues.map((value) => (
                                <option key={value} value={value}>
                                    {priorityLabels[value]}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="sr-only" htmlFor="customer-filter">
                            Filter by Customer
                        </label>

                        <select
                            id="customer-filter"
                            name="customerId"
                            defaultValue={customerId}
                            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                        >
                            <option value="">All Customers</option>

                            {filterResult.customers.map((customer) => (
                                <option key={customer.id} value={customer.id}>
                                    {customer.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="sr-only" htmlFor="technician-filter">
                            Filter by Technician
                        </label>

                        <select
                            id="technician-filter"
                            name="technicianId"
                            defaultValue={technicianId}
                            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                        >
                            <option value="">All Technicians</option>

                            {filterResult.technicians.map((technician) => (
                                <option key={technician.id} value={technician.id}>
                                    {technician.user.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
                    >
                        Apply
                    </button>

                    {hasFilters ? (
                        <Link
                            href="/work-orders"
                            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            Clear
                        </Link>
                    ) : null}
                </form>

                {filterResult.error ? (
                    <div
                        className="mt-6 rounded-md bg-red-50 p-4 text-sm text-red-800"
                        role="alert"
                    >
                        {filterResult.error}
                    </div>
                ) : null}

                {workOrderResult.error ? (
                    <div
                        className="mt-6 rounded-md bg-red-50 p-4 text-sm text-red-800"
                        role="alert"
                    >
                        {workOrderResult.error}
                    </div>
                ) : null}

                {!workOrderResult.error && workOrderResult.workOrders.length === 0 ? (
                    <div className="mt-8 rounded-lg border border-dashed border-slate-300 p-8 text-center">
                        <h2 className="text-lg font-semibold text-slate-900">
                            {hasFilters ? "No matching Work Orders" : "No Work Orders yet"}
                        </h2>

                        <p className="mt-2 text-sm text-slate-600">
                            {hasFilters
                                ? "Try another search term or filter combination."
                                : "Create the first Work Order to begin dispatching service work."}
                        </p>

                        {!hasFilters ? (
                            <Link
                                href="/work-orders/new"
                                className="mt-4 inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                            >
                                Create Work Order
                            </Link>
                        ) : null}
                    </div>
                ) : null}

                {!workOrderResult.error && workOrderResult.workOrders.length > 0 ? (
                    <div className="mt-8 overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <TableHeader>Work Order</TableHeader>
                                    <TableHeader>Customer</TableHeader>
                                    <TableHeader>Technician</TableHeader>
                                    <TableHeader>Status</TableHeader>
                                    <TableHeader>Priority</TableHeader>
                                    <TableHeader>Schedule</TableHeader>
                                    <TableHeader>
                                        <span className="sr-only">Actions</span>
                                    </TableHeader>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-200 bg-white">
                                {workOrderResult.workOrders.map((workOrder) => (
                                    <tr key={workOrder.id}>
                                        <TableCell>
                                            <Link
                                                href={`/work-orders/${workOrder.id}`}
                                                className="font-medium text-blue-600 hover:underline"
                                            >
                                                {workOrder.title}
                                            </Link>

                                            <p className="mt-1 text-xs text-slate-500">
                                                Created by {workOrder.createdBy.name}
                                            </p>
                                        </TableCell>

                                        <TableCell>
                                            <Link
                                                href={`/customers/${workOrder.customer.id}`}
                                                className="text-slate-900 hover:underline"
                                            >
                                                {workOrder.customer.name}
                                            </Link>

                                            <p className="mt-1 text-xs text-slate-500">
                                                {workOrder.customer.city}
                                            </p>
                                        </TableCell>

                                        <TableCell>
                                            {workOrder.technician ? (
                                                <>
                                                    <Link
                                                        href={`/technicians/${workOrder.technician.id}`}
                                                        className="text-slate-900 hover:underline"
                                                    >
                                                        {workOrder.technician.user.name}
                                                    </Link>

                                                    <p className="mt-1 text-xs text-slate-500">
                                                        {workOrder.technician.availability}
                                                    </p>
                                                </>
                                            ) : (
                                                <span className="text-slate-500">Unassigned</span>
                                            )}
                                        </TableCell>

                                        <TableCell>
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                    statusStyles[workOrder.status]
                                                }`}
                                            >
                                                {statusLabels[workOrder.status]}
                                            </span>
                                        </TableCell>

                                        <TableCell>
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                    priorityStyles[workOrder.priority]
                                                }`}
                                            >
                                                {priorityLabels[workOrder.priority]}
                                            </span>
                                        </TableCell>

                                        <TableCell>
                                            <p>{formatDate(workOrder.scheduledStart)}</p>
                                            {workOrder.scheduledEnd ? (
                                                <p className="mt-1 text-xs text-slate-500">
                                                    Ends {formatDate(workOrder.scheduledEnd)}
                                                </p>
                                            ) : null}
                                        </TableCell>

                                        <TableCell>
                                            <div className="flex justify-end gap-3">
                                                <Link
                                                    href={`/work-orders/${workOrder.id}`}
                                                    className="font-medium text-blue-600 hover:underline"
                                                >
                                                    View
                                                </Link>

                                                <Link
                                                    href={`/work-orders/${workOrder.id}/edit`}
                                                    className="font-medium text-slate-600 hover:underline"
                                                >
                                                    Edit
                                                </Link>
                                            </div>
                                        </TableCell>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : null}
            </section>
        </main>
    );
}

type TableElementProps = {
    children: ReactNode;
};

function TableHeader({ children }: TableElementProps) {
    return (
        <th
            scope="col"
            className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600"
        >
            {children}
        </th>
    );
}

function TableCell({ children }: TableElementProps) {
    return (
        <td className="px-4 py-4 align-top text-sm text-slate-700">
            {children}
        </td>
    );
}