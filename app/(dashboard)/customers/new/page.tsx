import Link from "next/link";
import { CustomerForm } from "@/components/forms/customer-form";
import { createCustomer } from "@/lib/customers/actions";
import { requireAnyRole } from "@/lib/permissions/server";

export default async function NewCustomerPage() {
    await requireAnyRole(["ADMIN", "DISPATCHER"]);

    return (
        <main className="p-6">
            <section className="mx-auto max-w-3xl rounded-xl bg-white p-6 shadow-sm">
                <div className="mb-6">
                    <Link
                        href="/customers"
                        className="text-sm font-medium text-blue-700 hover:text-blue-800"
                    >
                        ← Back to customers
                    </Link>

                    <h1 className="mt-3 text-2xl font-semibold text-slate-900">
                        Add customer
                    </h1>

                    <p className="mt-2 text-sm text-slate-600">
                        Enter the customer and service-address details.
                    </p>
                </div>

                <CustomerForm action={createCustomer} submitLabel="Create customer" />
            </section>
        </main>
    );
}