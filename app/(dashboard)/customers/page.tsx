import type { ReactNode } from "react";
import Link from "next/link";
import { listCustomers } from "@/lib/customers/queries";
import { requireAnyRole } from "@/lib/permissions/server";

type CustomersPageProps = {
    searchParams: Promise<{
        query?: string;
    }>;
};

function displayContact(value: string | null) {
    return value ?? "Not provided";
}

export default async function CustomersPage({
    searchParams,
}: CustomersPageProps) {
    await requireAnyRole(["ADMIN", "DISPATCHER"]);

    const { query = "" } = await searchParams;
    const result = await listCustomers(query);

    return (
        <main className="min-w-0 p-4 sm:p-6">
            <section className="mx-auto max-w-7xl rounded-xl bg-white p-4 shadow-sm sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-blue-700">FieldFlow</p>

                        <h1 className="mt-1 text-2xl font-semibold text-slate-900">
                            Customers
                        </h1>

                        <p className="mt-2 text-sm text-slate-600">
                            Search, view, create, and update service customers.
                        </p>
                    </div>

                    <Link
                        href="/customers/new"
                        className="inline-flex min-h-11 items-center justify-center rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:w-auto"
                    >
                        Add customer
                    </Link>
                </div>

                <form action="/customers" className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <div className="min-w-0 flex-1">
                        <label className="sr-only" htmlFor="customer-search">
                            Search customers
                        </label>

                        <input
                            id="customer-search"
                            name="query"
                            type="search"
                            defaultValue={query}
                            placeholder="Search by name, email, phone, or city"
                            maxLength={100}
                            className="min-h-11 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    <button
                        type="submit"
                        className="min-h-11 w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white outline-none hover:bg-slate-700 focus-visible:ring-2 focus-visible:ring-slate-700 focus-visible:ring-offset-2 sm:w-auto"
                    >
                        Search
                    </button>

                    {query ? (
                        <Link
                            href="/customers"
                            className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:w-auto"
                        >
                            Clear
                        </Link>
                    ) : null}
                </form>

                {result.error ? (
                    <div
                        className="mt-6 rounded-md bg-red-50 p-4 text-sm text-red-800"
                        role="alert"
                    >
                        {result.error}
                    </div>
                ) : null}

                {!result.error && result.customers.length === 0 ? (
                    <div className="mt-8 rounded-lg border border-dashed border-slate-300 p-6 text-center sm:p-8">
                        <h2 className="text-lg font-semibold text-slate-900">
                            {query ? "No matching customers" : "No customers yet"}
                        </h2>

                        <p className="mt-2 text-sm text-slate-600">
                            {query
                                ? "Try another name, email, phone number, or city."
                                : "Create the first customer to begin managing service work."}
                        </p>

                        {!query ? (
                            <Link
                                href="/customers/new"
                                className="mt-4 inline-flex min-h-11 items-center justify-center rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:w-auto"
                            >
                                Add customer
                            </Link>
                        ) : null}
                    </div>
                ) : null}

                {!result.error && result.customers.length > 0 ? (
                    <>
                        <p className="mt-6 text-xs text-slate-500 sm:hidden">
                            Scroll horizontally to view all customer columns.
                        </p>

                        <div className="mt-3 max-w-full overflow-x-auto rounded-lg border border-slate-200 sm:mt-8">
                            <table className="min-w-[900px] divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <CustomerHeader>Name</CustomerHeader>
                                        <CustomerHeader>Email</CustomerHeader>
                                        <CustomerHeader>Phone</CustomerHeader>
                                        <CustomerHeader>City</CustomerHeader>
                                        <CustomerHeader>Postcode</CustomerHeader>
                                        <CustomerHeader>
                                            <span className="sr-only">Actions</span>
                                        </CustomerHeader>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-200 bg-white">
                                    {result.customers.map((customer) => (
                                        <tr key={customer.id}>
                                            <CustomerCell>
                                                <Link
                                                    href={`/customers/${customer.id}`}
                                                    className="font-medium text-slate-900 hover:text-blue-700"
                                                >
                                                    {customer.name}
                                                </Link>
                                            </CustomerCell>

                                            <CustomerCell>
                                                <span className="break-all">
                                                    {displayContact(customer.email)}
                                                </span>
                                            </CustomerCell>

                                            <CustomerCell>
                                                {displayContact(customer.phone)}
                                            </CustomerCell>

                                            <CustomerCell>{customer.city}</CustomerCell>

                                            <CustomerCell>{customer.postcode}</CustomerCell>

                                            <CustomerCell>
                                                <div className="flex justify-end gap-3">
                                                    <Link
                                                        href={`/customers/${customer.id}`}
                                                        className="font-medium text-blue-700 hover:underline"
                                                    >
                                                        View
                                                    </Link>

                                                    <Link
                                                        href={`/customers/${customer.id}/edit`}
                                                        className="font-medium text-slate-600 hover:text-slate-900"
                                                    >
                                                        Edit
                                                    </Link>
                                                </div>
                                            </CustomerCell>
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

function CustomerHeader({ children }: TableElementProps) {
    return (
        <th
            scope="col"
            className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600"
        >
            {children}
        </th>
    );
}

function CustomerCell({ children }: TableElementProps) {
    return (
        <td className="px-4 py-4 align-top text-sm text-slate-700">
            {children}
        </td>
    );
}