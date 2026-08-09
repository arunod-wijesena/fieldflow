import Link from "next/link";
import { TechnicianForm } from "@/components/forms/technician-form";
import { createTechnicianProfile } from "@/lib/technicians/actions";
import { listEligibleTechnicianAccounts } from "@/lib/technicians/queries";
import { requireAnyRole } from "@/lib/permissions/server";

export default async function NewTechnicianPage() {
    await requireAnyRole(["ADMIN", "DISPATCHER"]);

    const result = await listEligibleTechnicianAccounts();

    return (
        <main className="p-6">
            <section className="mx-auto max-w-3xl rounded-xl bg-white p-6 shadow-sm">
                <div className="mb-6">
                    <Link
                        href="/technicians"
                        className="text-sm font-medium text-blue-700 hover:text-blue-800"
                    >
                        Back to technicians
                    </Link>

                    <h1 className="mt-3 text-2xl font-semibold text-slate-900">
                        Add technician profile
                    </h1>

                    <p className="mt-2 text-sm text-slate-600">
                        Link an eligible Technician account and record operational
                        skills and availability.
                    </p>
                </div>

                {result.error ? (
                    <div
                        className="rounded-md bg-red-50 p-4 text-sm text-red-800"
                        role="alert"
                    >
                        {result.error}
                    </div>
                ) : null}

                {!result.error && result.users.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center">
                        <h2 className="text-lg font-semibold text-slate-900">
                            No eligible Technician accounts
                        </h2>

                        <p className="mt-2 text-sm text-slate-600">
                            Every Technician account already has a profile, or no
                            Technician accounts are available.
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