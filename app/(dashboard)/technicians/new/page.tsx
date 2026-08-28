import Link from "next/link";
import { TechnicianForm } from "@/components/forms/technician-form";
import { createTechnicianProfile } from "@/lib/technicians/actions";
import { listEligibleTechnicianAccounts } from "@/lib/technicians/queries";
import { requireAnyRole } from "@/lib/permissions/server";

export default async function NewTechnicianPage() {
    await requireAnyRole(["ADMIN", "DISPATCHER"]);

    const result = await listEligibleTechnicianAccounts();

    return (
        <main className="min-w-0 p-4 sm:p-6">
            <section className="mx-auto max-w-3xl rounded-xl bg-white p-4 shadow-sm sm:p-6">
                <div className="mb-6">
                    <Link
                        href="/technicians"
                        className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900"
                    >
                        <span aria-hidden="true">←</span>
                        <span className="ml-1">Back to technicians</span>
                    </Link>

                    <h1 className="mt-3 text-2xl font-semibold text-slate-900">
                        Add technician profile
                    </h1>

                    <p className="mt-2 break-words text-sm text-slate-600">
                        Link an eligible Technician account and record operational skills
                        and availability.
                    </p>
                </div>

                {result.error ? (
                    <div
                        className="break-words rounded-md bg-red-50 p-4 text-sm text-red-800"
                        role="alert"
                    >
                        {result.error}
                    </div>
                ) : null}

                {!result.error && result.users.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center sm:p-8">
                        <h2 className="text-lg font-semibold text-slate-900">
                            No eligible Technician accounts
                        </h2>

                        <p className="mt-2 text-sm text-slate-600">
                            Every Technician account already has a profile, or no Technician
                            accounts are available.
                        </p>
                    </div>
                ) : null}

                {!result.error && result.users.length > 0 ? (
                    <TechnicianForm
                        action={createTechnicianProfile}
                        submitLabel="Create technician profile"
                        accounts={result.users}
                    />
                ) : null}
            </section>
        </main>
    );
}