import Link from "next/link";
import { notFound } from "next/navigation";
import { getCustomerById } from "@/lib/customers/queries";
import { requireAnyRole } from "@/lib/permissions/server";

type CustomerDetailsPageProps = {
    params: Promise<{
        id: string;
    }>;
};

function displayOptionalValue(value: string | null) {
    return value ?? "Not provided";
}

export default async function CustomerDetailsPage({
    params,
}: CustomerDetailsPageProps) {
    await requireAnyRole(["ADMIN", "DISPATCHER"]);

    const { id } = await params;
    const result = await getCustomerById(id);

    if (!result.customer) {
        if (
            result.error === "Customer not found." ||
            result.error === "Invalid customer identifier."
        ) {
            notFound();
        }

        return (
            <main className="p-6">
                <section className="mx-auto max-w-3xl rounded-xl bg-white p-6 shadow-sm">
                    <h1 className="text-2xl font-semibold text-slate-900">
                        Unable to load customer
                    </h1>

                    <p className="mt-2 text-slate-600">
                        {result.error ?? "The customer could not be loaded."}
                    </p>

                    <Link
                        href="/customers"
                        className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
                    >
                        Back to customers
                    </Link>
                </section>
            </main>
        );
    }

    const customer = result.customer;

    return (
        <main className="p-6">
            <section className="mx-auto max-w-3xl rounded-xl bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <Link
                            href="/customers"
                            className="text-sm font-medium text-blue-600 hover:text-blue-500"
                        >
                            Back to customers
                        </Link>

                        <h1 className="mt-3 text-2xl font-semibold text-slate-900">
                            {customer.name}
                        </h1>

                        <p className="mt-2 text-sm text-slate-600">
                            Customer and service-address details.
                        </p>
                    </div>

                    <Link
                        href={`/customers/${customer.id}/edit`}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-500"
                    >
                        Edit customer
                    </Link>
                </div>

                <dl className="mt-8 grid gap-6 sm:grid-cols-2">
                    <CustomerDetail
                        label="Email"
                        value={displayOptionalValue(customer.email)}
                    />

                    <CustomerDetail
                        label="Phone"
                        value={displayOptionalValue(customer.phone)}
                    />

                    <CustomerDetail
                        label="Address line 1"
                        value={customer.addressLine1}
                    />

                    <CustomerDetail
                        label="Address line 2"
                        value={displayOptionalValue(customer.addressLine2)}
                    />

                    <CustomerDetail label="City" value={customer.city} />

                    <CustomerDetail label="Postcode" value={customer.postcode} />
                </dl>

                <div className="mt-8 border-t border-slate-200 pt-6 text-sm text-slate-500">
                    <p>
                        Created:{" "}
                        <time dateTime={customer.createdAt.toISOString()}>
                            {customer.createdAt.toLocaleString()}
                        </time>
                    </p>

                    <p className="mt-1">
                        Last updated:{" "}
                        <time dateTime={customer.updatedAt.toISOString()}>
                            {customer.updatedAt.toLocaleString()}
                        </time>
                    </p>
                </div>
            </section>
        </main>
    );
}

type CustomerDetailProps = {
    label: string;
    value: string;
};

function CustomerDetail({ label, value }: CustomerDetailProps) {
    return (
        <div>
            <dt className="text-sm font-medium text-slate-500">{label}</dt>
            <dd className="mt-1 break-words text-slate-900">{value}</dd>
        </div>
    );
}