import Link from "next/link";
import { notFound } from "next/navigation";
import { CustomerForm } from "@/components/forms/customer-form";
import { updateCustomer } from "@/lib/customers/actions";
import { getCustomerById } from "@/lib/customers/queries";
import { requireAnyRole } from "@/lib/permissions/server";

type EditCustomerPageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function EditCustomerPage({
    params,
}: EditCustomerPageProps) {
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
                        className="text-sm font-medium text-blue-700 hover:text-blue-800"
                    >
                        ← Back to customers
                    </Link>
                </section>
            </main>
        );
    }

    const customer = result.customer;
    const updateCustomerWithId = updateCustomer.bind(null, customer.id);

    return (
        <main className="p-6">
            <section className="mx-auto max-w-3xl rounded-xl bg-white p-6 shadow-sm">
                <div className="mb-6">
                    <Link
                        href={`/customers/${customer.id}`}
                        className="text-sm font-medium text-blue-700 hover:text-blue-800"
                    >
                        ← Back to customer
                    </Link>

                    <h1 className="mt-3 text-2xl font-semibold text-slate-900">
                        Edit customer
                    </h1>

                    <p className="mt-2 text-sm text-slate-600">
                        Update the customer and service-address details.
                    </p>
                </div>

                <CustomerForm
                    action={updateCustomerWithId}
                    submitLabel="Save changes"
                    defaultValues={customer}
                />
            </section>
        </main>
    );
}