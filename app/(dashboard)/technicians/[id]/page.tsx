import Link from "next/link";
import { notFound } from "next/navigation";
import { getTechnicianById } from "@/lib/technicians/queries";
import { requireAnyRole } from "@/lib/permissions/server";

type TechnicianDetailsPageProps = {
    params: Promise<{
        id: string;
    }>;
};

const availabilityLabels = {
    AVAILABLE: "Available",
    BUSY: "Busy",
    UNAVAILABLE: "Unavailable",
} as const;

const availabilityStyles = {
    AVAILABLE: "bg-green-100 text-green-800",
    BUSY: "bg-amber-100 text-amber-800",
    UNAVAILABLE: "bg-slate-200 text-slate-700",
} as const;

function formatDate(value: Date) {
    return new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "UTC",
    }).format(value);
}

export default async function TechnicianDetailsPage({
    params,
}: TechnicianDetailsPageProps) {
    await requireAnyRole(["ADMIN", "DISPATCHER"]);

    const { id } = await params;
    const result = await getTechnicianById(id);

    if (!result.technician) {
        if (
            result.error === "Technician profile not found." ||
            result.error === "Invalid technician profile identifier."
        ) {
            notFound();
        }

        return (
            <main className="p-6">
                <section className="mx-auto max-w-4xl rounded-xl bg-white p-6 shadow-sm">
                    <h1 className="text-2xl font-semibold text-slate-900">
                        Unable to load technician
                    </h1>

                    <p className="mt-2 text-slate-600">
                        {result.error ?? "The technician profile could not be loaded."}
                    </p>

                    <Link
                        href="/technicians"
                        className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
                    >
                        Back to technicians
                    </Link>
                </section>
            </main>
        );
    }

    const technician = result.technician;

    return (
    <main className="p-6">
      <section className="mx-auto max-w-4xl rounded-xl bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link
              href="/technicians"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Back to technicians
            </Link>

            <h1 className="mt-3 text-2xl font-semibold text-slate-900">
              {technician.user.name}
            </h1>

            <p className="mt-1 text-sm text-slate-600">
              {technician.user.email}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                availabilityStyles[technician.availability]
              }`}
            >
              {availabilityLabels[technician.availability]}
            </span>

            <Link
              href={`/technicians/${technician.id}/edit`}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Edit technician
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <section className="rounded-lg border border-slate-200 p-5">
            <h2 className="text-sm font-medium text-slate-500">
              Linked account role
            </h2>

            <p className="mt-1 font-medium text-slate-900">
              {technician.user.role}
            </p>
          </section>

          <section className="rounded-lg border border-slate-200 p-5">
            <h2 className="text-sm font-medium text-slate-500">
              Assigned work orders
            </h2>

            <p className="mt-1 text-2xl font-semibold text-slate-900">
              {technician._count.workOrders}
            </p>
          </section>
        </div>

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-slate-900">Skills</h2>

          {technician.skills.length > 0 ? (
            <ul className="mt-3 flex flex-wrap gap-2">
              {technician.skills.map((skill) => (
                <li
                  key={skill.toLowerCase()}
                  className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-800"
                >
                  {skill}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-slate-600">
              No skills have been recorded.
            </p>
          )}
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-slate-900">
            Recent assigned work
          </h2>

          {technician.workOrders.length > 0 ? (
            <div className="mt-3 overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Work order
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Priority
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  {technician.workOrders.map((workOrder) => (
                    <tr key={workOrder.id}>
                      <td className="px-4 py-4 text-sm font-medium text-slate-900">
                        {workOrder.title}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-700">
                        {workOrder.customer.name}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-700">
                        {workOrder.status}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-700">
                        {workOrder.priority}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="mt-3 rounded-lg border border-dashed border-slate-300 p-6 text-center">
              <p className="text-sm text-slate-600">
                No work orders are currently assigned.
              </p>
            </div>
          )}
        </section>

        <div className="mt-8 border-t border-slate-200 pt-6 text-sm text-slate-500">
          <p>
            Profile created:{" "}
            <time dateTime={technician.createdAt.toISOString()}>
              {formatDate(technician.createdAt)}
            </time>
          </p>

          <p className="mt-1">
            Last updated:{" "}
            <time dateTime={technician.updatedAt.toISOString()}>
              {formatDate(technician.updatedAt)}
            </time>
          </p>
        </div>
      </section>
    </main>
  );
}