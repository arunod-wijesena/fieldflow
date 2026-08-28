import Link from "next/link";
import { notFound } from "next/navigation";
import { CompleteJobForm } from "@/components/forms/complete-job-form";
import { ProgressNoteForm } from "@/components/forms/progress-note-form";
import { StartWorkForm } from "@/components/forms/start-work-form";
import {
    addMyJobProgressNote,
    completeMyJob,
    startMyJob,
} from "@/lib/my-jobs/actions";
import { getMyJobById } from "@/lib/my-jobs/queries";
import { requireRole } from "@/lib/permissions/server";

type MyJobDetailsPageProps = {
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

function displayOptionalValue(value: string | null) {
    return value ?? "Not provided";
}

export default async function MyJobDetailsPage({
    params,
}: MyJobDetailsPageProps) {
    await requireRole("TECHNICIAN");

    const { id } = await params;
    const result = await getMyJobById(id);

    if (!result.job) {
        if (
            result.error === "Assigned job not found." ||
            result.error === "Invalid Work Order identifier."
        ) {
            notFound();
        }

        return (
            <main className="min-w-0 p-4 sm:p-6">
                <section className="mx-auto max-w-4xl rounded-xl bg-white p-4 shadow-sm sm:p-6">
                    <h1 className="text-2xl font-semibold text-slate-900">
                        Unable to load job
                    </h1>

                    <p className="mt-2 break-words text-slate-600">
                        {result.error ?? "The assigned job could not be loaded."}
                    </p>

                    <Link
                        href="/my-jobs"
                        className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900"
                    >
                        <span aria-hidden="true">←</span>
                        <span className="ml-1">Back to My Jobs</span>
                    </Link>
                </section>
            </main>
        );
    }

    const job = result.job;

    const startMyJobWithId = startMyJob.bind(null, job.id);

    const addMyJobProgressNoteWithId = addMyJobProgressNote.bind(
        null,
        job.id,
    );

    const completeMyJobWithId = completeMyJob.bind(
        null,
        job.id,
    );

    return (
        <main className="min-w-0 p-4 sm:p-6">
            <section className="mx-auto max-w-5xl rounded-xl bg-white p-4 shadow-sm sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                        <Link
                            href="/my-jobs"
                            className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900"
                        >
                            <span aria-hidden="true">←</span>
                            <span className="ml-1">Back to My Jobs</span>
                        </Link>

                        <h1 className="mt-3 break-words text-2xl font-semibold text-slate-900">
                            {job.title}
                        </h1>

                        <p className="mt-2 max-w-3xl whitespace-pre-wrap break-words text-slate-700">
                            {job.description}
                        </p>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                        <span
                            className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${statusStyles[job.status]
                                }`}
                        >
                            {statusLabels[job.status]}
                        </span>

                        <span
                            className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${priorityStyles[job.priority]
                                }`}
                        >
                            {priorityLabels[job.priority]}
                        </span>
                    </div>
                </div>

                <div className="mt-8 grid gap-6 lg:grid-cols-2">
                    <section className="min-w-0 rounded-lg border border-slate-200 p-4 sm:p-5">
                        <h2 className="text-lg font-semibold text-slate-900">
                            Customer
                        </h2>

                        <p className="mt-2 break-words font-medium text-slate-900">
                            {job.customer.name}
                        </p>

                        <address className="mt-3 break-words not-italic text-sm leading-6 text-slate-700">
                            <p>{job.customer.addressLine1}</p>

                            {job.customer.addressLine2 ? (
                                <p>{job.customer.addressLine2}</p>
                            ) : null}

                            <p>
                                {job.customer.city}, {job.customer.postcode}
                            </p>
                        </address>

                        <dl className="mt-4 space-y-3">
                            <DetailRow
                                label="Phone"
                                value={displayOptionalValue(job.customer.phone)}
                            />

                            <DetailRow
                                label="Email"
                                value={displayOptionalValue(job.customer.email)}
                                breakAll
                            />
                        </dl>
                    </section>

                    <section className="min-w-0 rounded-lg border border-slate-200 p-4 sm:p-5">
                        <h2 className="text-lg font-semibold text-slate-900">
                            Schedule
                        </h2>

                        <dl className="mt-4 space-y-4">
                            <DetailRow
                                label="Scheduled start"
                                value={formatDate(job.scheduledStart)}
                            />

                            <DetailRow
                                label="Scheduled end"
                                value={formatDate(job.scheduledEnd)}
                            />
                        </dl>
                    </section>
                </div>

                {job.status === "ASSIGNED" ? (
                    <section className="mt-8 min-w-0 rounded-lg border border-blue-200 bg-blue-50 p-4 sm:p-5">
                        <h2 className="text-lg font-semibold text-blue-900">
                            Ready to start
                        </h2>

                        <p className="mt-2 break-words text-sm text-blue-800">
                            Start work when you are ready to begin this assigned job.
                        </p>

                        <div className="mt-4">
                            <StartWorkForm action={startMyJobWithId} />
                        </div>
                    </section>
                ) : null}

                {job.status === "IN_PROGRESS" ? (
                    <div className="mt-8 grid gap-6 xl:grid-cols-2">
                        <section className="min-w-0 rounded-lg border border-amber-200 bg-amber-50 p-4 sm:p-5">
                            <h2 className="text-lg font-semibold text-amber-900">
                                Add progress
                            </h2>

                            <p className="mt-2 break-words text-sm text-amber-800">
                                Record work completed, findings, or other operational
                                progress.
                            </p>

                            <div className="mt-4 min-w-0">
                                <ProgressNoteForm action={addMyJobProgressNoteWithId} />
                            </div>
                        </section>

                        <section className="min-w-0 rounded-lg border border-green-200 bg-green-50 p-4 sm:p-5">
                            <h2 className="text-lg font-semibold text-green-900">
                                Complete job
                            </h2>

                            <p className="mt-2 break-words text-sm text-green-800">
                                Add final completion notes before marking the job as
                                completed.
                            </p>

                            <div className="mt-4 min-w-0">
                                <CompleteJobForm action={completeMyJobWithId} />
                            </div>
                        </section>
                    </div>
                ) : null}

                <section className="mt-8 min-w-0">
                    <h2 className="text-lg font-semibold text-slate-900">
                        Job history
                    </h2>

                    {job.updates.length > 0 ? (
                        <ol className="mt-4 space-y-4">
                            {job.updates.map((update) => (
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
                                No job history is available.
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