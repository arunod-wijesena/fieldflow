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
      <main className="min-w-0 p-4 sm:p-6">
        <section className="mx-auto max-w-4xl rounded-xl bg-white p-4 shadow-sm sm:p-6">
          <h1 className="text-2xl font-semibold text-slate-900">
            Unable to load technician
          </h1>

          <p className="mt-2 break-words text-slate-600">
            {result.error ?? "The technician profile could not be loaded."}
          </p>

          <Link
            href="/technicians"
            className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <span aria-hidden="true">←</span>
            <span className="ml-1">Back to technicians</span>
          </Link>
        </section>
      </main>
    );
  }

  const technician = result.technician;

  return (
    <main className="min-w-0 p-4 sm:p-6">
      <section className="mx-auto max-w-4xl rounded-xl bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <Link
              href="/technicians"
              className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              <span aria-hidden="true">←</span>
              <span className="ml-1">Back to technicians</span>
            </Link>

            <h1 className="mt-3 break-words text-2xl font-semibold text-slate-900">
              {technician.user.name}
            </h1>

            <p className="mt-1 break-all text-sm text-slate-600">
              {technician.user.email}
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:items-end">
            <span
              className={`inline-flex w-fit rounded-full px-3 py-1 text-sm font-medium ${
                availabilityStyles[technician.availability]
              }`}
            >
              {availabilityLabels[technician.availability]}
            </span>

            <Link
              href={`/technicians/${technician.id}/edit`}
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:w-auto"
            >
              Edit technician
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 sm:gap-6">
          <section className="min-w-0 rounded-lg border border-slate-200 p-4 sm:p-5">
            <h2 className="text-sm font-medium text-slate-500">
              Linked account role
            </h2>

            <p className="mt-1 break-words font-medium text-slate-900">
              {technician.user.role}
            </p>
          </section>

          <section className="min-w-0 rounded-lg border border-slate-200 p-4 sm:p-5">
            <h2 className="text-sm font-medium text-slate-500">
              Assigned work orders
            </h2>

            <p className="mt-1 text-2xl font-semibold text-slate-900">
              {technician._count.workOrders}
            </p>
          </section>
        </div>

        <section className="mt-8 min-w-0">
          <h2 className="text-lg font-semibold text-slate-900">Skills</h2>

          {technician.skills.length > 0 ? (
            <ul className="mt-3 flex min-w-0 flex-wrap gap-2">
              {technician.skills.map((skill) => (
                <li
                  key={skill.toLowerCase()}
                  className="max-w-full break-words rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-800"
                >
                  {skill}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-slate-500">
              No operational skills recorded for this technician.
            </p>
          )}
        </section>

        <section className="mt-8 min-w-0">
          <h2 className="text-lg font-semibold text-slate-900">
            Recent assigned work
          </h2>

          {technician.workOrders.length > 0 ? (
            <>
              <p className="mt-4 text-xs text-slate-500 sm:hidden">
                Scroll horizontally to view all assigned work columns.
              </p>

              <div className="mt-3 max-w-full overflow-x-auto rounded-lg border border-slate-200">
                <table className="min-w-[720px] divide-y divide-slate-200">
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

                  <tbody className="divide-y divide-slate-200 bg-white">
                    {technician.workOrders.map((workOrder) => (
                      <tr key={workOrder.id}>
                        <td className="px-4 py-4 text-sm font-medium text-slate-900">
                          <span className="break-words">
                            {workOrder.title}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-sm text-slate-700">
                          <span className="break-words">
                            {workOrder.customer.name}
                          </span>
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
            </>
          ) : (
            <div className="mt-3 rounded-lg border border-dashed border-slate-300 p-6 text-center">
              <p className="text-sm text-slate-600">
                No assigned work orders recorded yet.
              </p>
            </div>
          )}
        </section>

        <div className="mt-8 border-t border-slate-200 pt-6 text-sm text-slate-500">
          <p className="break-words">
            Profile created:{" "}
            <time dateTime={technician.createdAt.toISOString()}>
              {formatDate(technician.createdAt)}
            </time>
          </p>

          <p className="mt-1 break-words">
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