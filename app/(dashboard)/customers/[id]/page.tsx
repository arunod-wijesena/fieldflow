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

function formatDate(value: Date) {
    return new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "UTC",
    }).format(value);
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
            <main className="min-w-0 p-4 sm:p-6">
                <section className="mx-auto max-w-3xl rounded-xl bg-white p-4 shadow-sm sm:p-6">
                    <h1 className="text-2xl font-semibold text-slate-900">
                        Unable to load customer
                    </h1>

                    <p className="mt-2 break-words text-slate-600">
                        {result.error ?? "The customer could not be loaded."}
                    </p>

                    <Link
                        href="/customers"
                        className="inline-flex items-center text-sm font-medium text-blue-700 hover:underline"
                    >
                        Back to customers
                    </Link>
                </section>
            </main>
        );
    }

    const customer = result.customer;

    return (
        <main className="min-w-0 p-4 sm:p-6">
            <section className="mx-auto max-w-3xl rounded-xl bg-white p-4 shadow-sm sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                        <Link
                            href="/customers"
                            className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900"
                        >
                            <span aria-hidden="true">←</span>
                            <span className="ml-1">Back to customers</span>
                        </Link>

                        <h1 className="mt-3 break-words text-2xl font-semibold text-slate-900">
                            {customer.name}
                        </h1>

                        <p className="mt-2 text-sm text-slate-600">
                            Customer and service-address details.
                        </p>
                    </div>

                    <Link
                        href={`/customers/${customer.id}/edit`}
                        className="inline-flex min-h-11 items-center justify-center rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:w-auto"
                    >
                        Edit customer
                    </Link>
                </div>

                <dl className="mt-8 grid gap-6 sm:grid-cols-2">
                    <CustomerDetail
                        label="Email"
                        value={displayOptionalValue(customer.email)}
                        breakAll
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
                    <p className="break-words">
                        Created:{" "}
                        <time dateTime={customer.createdAt.toISOString()}>
                            {formatDate(customer.createdAt)}
                        </time>
                    </p>

                    <p className="mt-1 break-words">
                        Last updated:{" "}
                        <time dateTime={customer.updatedAt.toISOString()}>
                            {formatDate(customer.updatedAt)}
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
    breakAll?: boolean;
};

function CustomerDetail({
    label,
    value,
    breakAll = false,
}: CustomerDetailProps) {
    return (
        <div className="min-w-0">
            <dt className="text-sm font-medium text-slate-500">{label}</dt>

            <dd
                className={`mt-1 text-slate-900 ${breakAll ? "break-all" : "break-words"
                    }`}
            >
                {value}
            </dd>
        </div>
    );
}