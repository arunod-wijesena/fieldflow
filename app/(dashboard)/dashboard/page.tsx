import Link from "next/link";
import { getDashboardData } from "@/lib/dashboard/queries";
import { requireAnyRole } from "@/lib/permissions/server";

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

export default async function DashboardPage() {
  await requireAnyRole(["ADMIN", "DISPATCHER"]);

  const result = await getDashboardData();

  if (!result.data) {
    return (
      <main className="p-6">
        <section className="mx-auto max-w-7xl rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-blue-700">FieldFlow</p>

          <h1 className="mt-1 text-2xl font-semibold text-slate-900">
            Dashboard
          </h1>

          <div
            className="mt-6 rounded-md bg-red-50 p-4 text-sm text-red-800"
            role="alert"
          >
            {result.error ?? "Unable to load Dashboard information."}
          </div>
        </section>
      </main>
    );
  }

  const {
    totalWorkOrders,
    statusCounts,
    availabilityCounts,
    recentWorkOrders,
  } = result.data;

  const workOrderCards = [
    {
      label: "Total Work Orders",
      value: totalWorkOrders,
      href: "/work-orders",
      style: "border-slate-200 bg-slate-50",
    },
    {
      label: "Unassigned",
      value: statusCounts.UNASSIGNED,
      href: "/work-orders?status=UNASSIGNED",
      style: "border-slate-200 bg-slate-50",
    },
    {
      label: "Assigned",
      value: statusCounts.ASSIGNED,
      href: "/work-orders?status=ASSIGNED",
      style: "border-blue-200 bg-blue-50",
    },
    {
      label: "In Progress",
      value: statusCounts.IN_PROGRESS,
      href: "/work-orders?status=IN_PROGRESS",
      style: "border-amber-200 bg-amber-50",
    },
    {
      label: "Completed",
      value: statusCounts.COMPLETED,
      href: "/work-orders?status=COMPLETED",
      style: "border-green-200 bg-green-50",
    },
    {
      label: "Cancelled",
      value: statusCounts.CANCELLED,
      href: "/work-orders?status=CANCELLED",
      style: "border-red-200 bg-red-50",
    },
  ];

  return (
    <main className="p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-xl bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-blue-700">FieldFlow</p>

              <h1 className="mt-1 text-2xl font-semibold text-slate-900">
                Dashboard
              </h1>

              <p className="mt-2 text-sm text-slate-600">
                Review current Work Orders, Technician availability, and
                recent operational activity.
              </p>
            </div>

            <Link
              href="/work-orders/new"
              className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
            >
              Create Work Order
            </Link>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {workOrderCards.map((card) => (
              <Link
                key={card.label}
                href={card.href}
                className={`rounded-lg border p-5 transition hover:shadow-md ${card.style}`}
              >
                <p className="text-sm font-medium text-slate-600">
                  {card.label}
                </p>

                <p className="mt-2 text-3xl font-semibold text-slate-900">
                  {card.value}
                </p>

                <p className="mt-2 text-xs font-medium text-blue-700">
                  View Work Orders
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-xl bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Technician availability
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Current operational availability across Technician profiles.
              </p>
            </div>

            <Link
              href="/technicians"
              className="text-sm font-medium text-blue-700 hover:text-blue-800"
            >
              View Technicians
            </Link>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <AvailabilityCard
              label="Available"
              value={availabilityCounts.AVAILABLE}
              style="border-green-200 bg-green-50 text-green-900"
            />

            <AvailabilityCard
              label="Busy"
              value={availabilityCounts.BUSY}
              style="border-amber-200 bg-amber-50 text-amber-900"
            />

            <AvailabilityCard
              label="Unavailable"
              value={availabilityCounts.UNAVAILABLE}
              style="border-slate-300 bg-slate-100 text-slate-900"
            />
          </div>
        </section>

        <section className="rounded-xl bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Recent Work Orders
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                The eight Work Orders with the most recent changes.
              </p>
            </div>

            <Link
              href="/work-orders"
              className="text-sm font-medium text-blue-700 hover:text-blue-800"
            >
              View all Work Orders
            </Link>
          </div>

          {recentWorkOrders.length === 0 ? (
            <div className="mt-6 rounded-lg border border-dashed border-slate-300 p-8 text-center">
              <h3 className="font-semibold text-slate-900">
                No Work Orders yet
              </h3>

              <p className="mt-2 text-sm text-slate-600">
                Create the first Work Order to begin displaying recent
                operational activity.
              </p>

              <Link
                href="/work-orders/new"
                className="mt-4 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
              >
                Create Work Order
              </Link>
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <TableHeader>Work Order</TableHeader>
                    <TableHeader>Customer</TableHeader>
                    <TableHeader>Technician</TableHeader>
                    <TableHeader>Status</TableHeader>
                    <TableHeader>Priority</TableHeader>
                    <TableHeader>Schedule</TableHeader>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 bg-white">
                  {recentWorkOrders.map((workOrder) => (
                    <tr key={workOrder.id}>
                      <TableCell>
                        <Link
                          href={`/work-orders/${workOrder.id}`}
                          className="font-medium text-blue-700 hover:text-blue-800 hover:underline"
                        >
                          {workOrder.title}
                        </Link>

                        <p className="mt-1 text-xs text-slate-500">
                          Updated {formatDate(workOrder.updatedAt)}
                        </p>
                      </TableCell>

                      <TableCell>
                        <Link
                          href={`/customers/${workOrder.customer.id}`}
                          className="font-medium text-slate-900 hover:text-blue-700 hover:underline"
                        >
                          {workOrder.customer.name}
                        </Link>

                        <p className="mt-1 text-xs text-slate-500">
                          {workOrder.customer.city}
                        </p>
                      </TableCell>

                      <TableCell>
                        {workOrder.technician ? (
                          <Link
                            href={`/technicians/${workOrder.technician.id}`}
                            className="font-medium text-slate-900 hover:text-blue-700 hover:underline"
                          >
                            {workOrder.technician.user.name}
                          </Link>
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
                        {formatDate(workOrder.scheduledStart)}
                      </TableCell>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Quick links</h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <QuickLink
              href="/customers"
              title="Customers"
              description="Manage customer directory and service locations."
            />
            <QuickLink
              href="/technicians"
              title="Technicians"
              description="View technician roster and schedule availability."
            />
            <QuickLink
              href="/work-orders"
              title="Work Orders"
              description="Track, assign, and manage field service jobs."
            />
            <QuickLink
              href="/work-orders/new"
              title="New Work Order"
              description="Create a new work order for dispatching."
            />
          </div>
        </section>
      </div>
    </main>
  );
}

type AvailabilityCardProps = {
  label: string;
  value: number;
  style: string;
};

function AvailabilityCard({
  label,
  value,
  style,
}: AvailabilityCardProps) {
  return (
    <div className={`rounded-lg border p-5 ${style}`}>
      <p className="text-sm font-medium">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}

type TableElementProps = {
  children: React.ReactNode;
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

type QuickLinkProps = {
  href: string;
  title: string;
  description: string;
};

function QuickLink({ href, title, description }: QuickLinkProps) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-slate-200 bg-slate-50 p-5 transition hover:border-blue-300 hover:bg-blue-50/50"
    >
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
    </Link>
  );
}