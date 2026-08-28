import Link from "next/link";
import { CustomerForm } from "@/components/forms/customer-form";
import { createCustomer } from "@/lib/customers/actions";
import { requireAnyRole } from "@/lib/permissions/server";

export default async function NewCustomerPage() {
    await requireAnyRole(["ADMIN", "DISPATCHER"]);

    return (
        <main className="min-w-0 p-4 sm:p-6">
            <section className="mx-auto max-w-3xl rounded-xl bg-white p-4 shadow-sm sm:p-6">
                <div className="mb-6">
                    <Link
                        href="/customers"
                        className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900"
                    >
                        <span aria-hidden="true">←</span>
                        <span className="ml-1">Back to customers</span>
                    </Link>

                    <h1 className="mt-3 text-2xl font-semibold text-slate-900">
                        Add customer
                    </h1>

                    <p className="mt-2 text-sm text-slate-600">
                        Enter the customer and service-address details.
                    </p>
                </div>

                <CustomerForm action={createCustomer} submitLabel="Save customer" />
            </section>
        </main>
    );
}