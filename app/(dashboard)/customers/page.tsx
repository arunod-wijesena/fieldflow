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
        <main className="p-6">
            <section className="mx-auto max-w-7xl rounded-xl bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
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
                        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        Add customer
                    </Link>
                </div>

                <form action="/customers" method="GET" className="mt-6 flex flex-wrap items-center gap-3">
                    <div className="flex-1">
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
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    <button
                        type="submit"
                        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
                    >
                        Search
                    </button>

                    {query ? (
                        <Link
                            href="/customers"
                            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
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
                    <div className="mt-8 rounded-lg border border-dashed border-slate-300 p-8 text-center">
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
                                className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                            >
                                Add customer
                            </Link>
                        ) : null}
                    </div>
                ) : null}

                {!result.error && result.customers.length > 0 ? (
                    <div className="mt-8 overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
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
                                                className="font-medium text-slate-900 hover:underline"
                                            >
                                                {customer.name}
                                            </Link>
                                        </CustomerCell>

                                        <CustomerCell>
                                            {displayContact(customer.email)}
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
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    View
                                                </Link>

                                                <Link
                                                    href={`/customers/${customer.id}/edit`}
                                                    className="text-blue-600 hover:underline"
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
        <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-700">
            {children}
        </td>
    );
}