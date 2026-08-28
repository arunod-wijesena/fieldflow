import type { ReactNode } from "react";
import Link from "next/link";
import { requireAnyRole } from "@/lib/permissions/server";
import { listTechnicians } from "@/lib/technicians/queries";
import { technicianAvailabilityValues } from "@/lib/validation/technician";

type TechniciansPageProps = {
    searchParams: Promise<{
        query?: string;
        availability?: string;
    }>;
};

const availabilityLabels = {
    AVAILABLE: "Available",
    BUSY: "Busy",
    UNAVAILABLE: "Unavailable",
} satisfies Record<
    (typeof technicianAvailabilityValues)[number],
    string
>;

const availabilityStyles = {
    AVAILABLE: "bg-green-100 text-green-800",
    BUSY: "bg-amber-100 text-amber-800",
    UNAVAILABLE: "bg-slate-200 text-slate-700",
} satisfies Record<
    (typeof technicianAvailabilityValues)[number],
    string
>;

export default async function TechniciansPage({
    searchParams,
}: TechniciansPageProps) {
    await requireAnyRole(["ADMIN", "DISPATCHER"]);

    const { query = "", availability = "" } = await searchParams;

    const result = await listTechnicians(query, availability);

    const hasFilters = Boolean(query || availability);

    return (
        <main className="min-w-0 p-4 sm:p-6">
            <section className="mx-auto max-w-7xl rounded-xl bg-white p-4 shadow-sm sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-blue-700">FieldFlow</p>

                        <h1 className="mt-1 text-2xl font-semibold text-slate-900">
                            Technicians
                        </h1>

                        <p className="mt-2 text-sm text-slate-600">
                            Search and manage technician skills, availability, and assigned
                            work.
                        </p>
                    </div>

                    <Link
                        href="/technicians/new"
                        className="inline-flex min-h-11 items-center justify-center rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:w-auto"
                    >
                        Add technician profile
                    </Link>
                </div>

                <form action="/technicians" className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <div className="min-w-0 flex-1">
                        <label className="sr-only" htmlFor="technician-search">
                            Search technicians
                        </label>

                        <input
                            id="technician-search"
                            name="query"
                            type="search"
                            defaultValue={query}
                            placeholder="Search by name, email, or exact skill"
                            maxLength={100}
                            className="min-h-11 w-full min-w-0 rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    <div className="min-w-0 sm:w-48">
                        <label className="sr-only" htmlFor="availability-filter">
                            Filter by availability
                        </label>

                        <select
                            id="availability-filter"
                            name="availability"
                            defaultValue={availability}
                            className="min-h-11 w-full min-w-0 rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                        >
                            <option value="">All availability</option>

                            {technicianAvailabilityValues.map((value) => (
                                <option key={value} value={value}>
                                    {availabilityLabels[value]}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="min-h-11 w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white outline-none hover:bg-slate-700 focus-visible:ring-2 focus-visible:ring-slate-700 focus-visible:ring-offset-2 sm:w-auto"
                    >
                        Apply
                    </button>

                    {hasFilters ? (
                        <Link
                            href="/technicians"
                            className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:w-auto"
                        >
                            Clear
                        </Link>
                    ) : null}
                </form>

                {result.error ? (
                    <div
                        className="mt-6 break-words rounded-md bg-red-50 p-4 text-sm text-red-800"
                        role="alert"
                    >
                        {result.error}
                    </div>
                ) : null}

                {!result.error && result.technicians.length === 0 ? (
                    <div className="mt-8 rounded-lg border border-dashed border-slate-300 p-6 text-center sm:p-8">
                        <h2 className="text-lg font-semibold text-slate-900">
                            {hasFilters
                                ? "No matching technicians"
                                : "No technician profiles yet"}
                        </h2>

                        <p className="mt-2 text-sm text-slate-600">
                            {hasFilters
                                ? "Try another search term or availability filter."
                                : "Create the first technician profile to support work assignment."}
                        </p>

                        {!hasFilters ? (
                            <Link
                                href="/technicians/new"
                                className="mt-4 inline-flex min-h-11 items-center justify-center rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:w-auto"
                            >
                                Add technician profile
                            </Link>
                        ) : null}
                    </div>
                ) : null}

                {!result.error && result.technicians.length > 0 ? (
                    <>
                        <p className="mt-6 text-xs text-slate-500 sm:hidden">
                            Scroll horizontally to view all technician columns.
                        </p>

                        <div className="mt-3 max-w-full overflow-x-auto rounded-lg border border-slate-200 sm:mt-8">
                            <table className="min-w-[900px] divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <TableHeader>Technician</TableHeader>
                                        <TableHeader>Skills</TableHeader>
                                        <TableHeader>Availability</TableHeader>
                                        <TableHeader>Assigned jobs</TableHeader>
                                        <TableHeader>
                                            <span className="sr-only">Actions</span>
                                        </TableHeader>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-200 bg-white">
                                    {result.technicians.map((technician) => (
                                        <tr key={technician.id}>
                                            <TableCell>
                                                <Link
                                                    href={`/technicians/${technician.id}`}
                                                    className="font-medium text-slate-900 hover:text-blue-700"
                                                >
                                                    {technician.user.name}
                                                </Link>

                                                <p className="mt-1 max-w-xs break-all text-xs text-slate-500">
                                                    {technician.user.email}
                                                </p>
                                            </TableCell>

                                            <TableCell>
                                                {technician.skills.length > 0 ? (
                                                    <div className="flex max-w-md flex-wrap gap-1">
                                                        {technician.skills.map((skill: string) => (
                                                            <span
                                                                key={skill.toLowerCase()}
                                                                className="max-w-full break-words rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-800"
                                                            >
                                                                {skill}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-500">
                                                        No skills recorded
                                                    </span>
                                                )}
                                            </TableCell>

                                            <TableCell>
                                                <span
                                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${availabilityStyles[
                                                        technician.availability as keyof typeof availabilityStyles
                                                    ] ?? "bg-slate-100 text-slate-800"
                                                        }`}
                                                >
                                                    {availabilityLabels[
                                                        technician.availability as keyof typeof availabilityLabels
                                                    ] ?? technician.availability}
                                                </span>
                                            </TableCell>

                                            <TableCell>
                                                {technician._count.workOrders}
                                            </TableCell>

                                            <TableCell>
                                                <div className="flex justify-end gap-3">
                                                    <Link
                                                        href={`/technicians/${technician.id}`}
                                                        className="font-medium text-blue-700 hover:underline"
                                                    >
                                                        View
                                                    </Link>

                                                    <Link
                                                        href={`/technicians/${technician.id}/edit`}
                                                        className="font-medium text-slate-600 hover:text-slate-900"
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
                    </>
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