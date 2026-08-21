import Link from "next/link";
import { listMyJobs } from "@/lib/my-jobs/queries";
import { requireRole } from "@/lib/permissions/server";

const statusLabels = {
    UNASSIGNED: "Unassigned",
    ASSIGNED: "Assigned",
    IN_PROGRESS: "In progress",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
} as const;

const statusStyles = {
    UNASSIGNED: "bg-slate-100 text-slate-700",
    ASSIGNED: "bg-blue-100 text-blue-800",
    IN_PROGRESS: "bg-amber-100 text-amber-800",
    COMPLETED: "bg-emerald-100 text-emerald-800",
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

export default async function MyJobsPage() {
    await requireRole("TECHNICIAN");

    const result = await listMyJobs();

    return (
        <main className="p-6">
            <section className="mx-auto max-w-6xl rounded-xl bg-white p-6 shadow-sm">
                <div>
                    <p className="text-sm font-medium text-blue-700">FieldFlow</p>

                    <h1 className="mt-1 text-2xl font-semibold text-slate-900">
                        My Jobs
                    </h1>

                    <p className="mt-2 text-sm text-slate-600">
                        View assigned work and jobs currently in progress.
                    </p>
                </div>

                {result.error ? (
                    <div
                        className="mt-6 rounded-md bg-red-50 p-4 text-sm text-red-800"
                        role="alert"
                    >
                        {result.error}
                    </div>
                ) : null}

                {!result.error && result.jobs.length === 0 ? (
                    <div className="mt-8 rounded-lg border border-dashed border-slate-300 p-8 text-center">
                        <h2 className="text-lg font-semibold text-slate-900">
                            No active jobs
                        </h2>

                        <p className="mt-2 text-sm text-slate-600">
                            No assigned or in-progress Work Orders are currently available.
                        </p>
                    </div>
                ) : null}

                {!result.error && result.jobs.length > 0 ? (
                    <div className="mt-8 grid gap-5 lg:grid-cols-2">
                        {result.jobs.map((job) => (
                            <article
                                key={job.id}
                                className="rounded-xl border border-slate-200 p-5"
                            >
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <Link
                                            href={`/my-jobs/${job.id}`}
                                            className="text-lg font-semibold text-slate-900 hover:text-blue-600"
                                        >
                                            {job.title}
                                        </Link>

                                        <p className="mt-1 text-sm text-slate-600">
                                            {job.customer.name}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                statusStyles[job.status]
                                            }`}
                                        >
                                            {statusLabels[job.status]}
                                        </span>

                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                priorityStyles[job.priority]
                                            }`}
                                        >
                                            {priorityLabels[job.priority]}
                                        </span>
                                    </div>
                                </div>

                                <p className="mt-4 line-clamp-3 whitespace-pre-wrap text-sm text-slate-700">
                                    {job.description}
                                </p>

                                <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                            Scheduled start
                                        </dt>
                                        <dd className="mt-1 text-sm text-slate-900">
                                            {formatDate(job.scheduledStart)}
                                        </dd>
                                    </div>

                                    <div>
                                        <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                            Scheduled end
                                        </dt>
                                        <dd className="mt-1 text-sm text-slate-900">
                                            {formatDate(job.scheduledEnd)}
                                        </dd>
                                    </div>
                                </dl>

                                <div className="mt-5 rounded-md bg-slate-50 p-4">
                                    <p className="text-sm font-medium text-slate-900">
                                        Service location
                                    </p>

                                    <address className="mt-1 not-italic text-sm leading-6 text-slate-600">
                                        <span className="block">
                                            {job.customer.addressLine1}
                                        </span>

                                        {job.customer.addressLine2 ? (
                                            <span className="block">
                                                {job.customer.addressLine2}
                                            </span>
                                        ) : null}

                                        <span className="block">
                                            {job.customer.city}, {job.customer.postcode}
                                        </span>
                                    </address>
                                </div>

                                {job.updates[0]?.note ? (
                                    <div className="mt-4">
                                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                            Latest update
                                        </p>

                                        <p className="mt-1 text-sm text-slate-700">
                                            {job.updates[0].note}
                                        </p>
                                    </div>
                                ) : null}

                                <div className="mt-5 border-t border-slate-200 pt-4 text-right">
                                    <Link
                                        href={`/my-jobs/${job.id}`}
                                        className="inline-flex text-sm font-medium text-blue-700 hover:underline"
                                    >
                                        View job &rarr;
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : null}
            </section>
        </main>
    );
}