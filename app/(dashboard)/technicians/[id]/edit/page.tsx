import Link from "next/link";
import { notFound } from "next/navigation";
import { TechnicianForm } from "@/components/forms/technician-form";
import { requireAnyRole } from "@/lib/permissions/server";
import { updateTechnicianProfile } from "@/lib/technicians/actions";
import { getTechnicianById } from "@/lib/technicians/queries";

type EditTechnicianPageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function EditTechnicianPage({
    params,
}: EditTechnicianPageProps) {
    await requireAnyRole(["ADMIN", "DISPATCHER"]);

    const { id } = await params;
    const result = await getTechnicianById(id);

    if (!result.technician) {
        if (
            result.error === "Technician profile not found." ||
            result.error === "Invalid technician profile identifier."
        ) {
            notFound();
        }

        return (
            <main className="p-6">
                <section className="mx-auto max-w-3xl rounded-xl bg-white p-6 shadow-sm">
                    <h1 className="text-2xl font-semibold text-slate-900">
                        Unable to load technician
                    </h1>

                    <p className="mt-2 text-slate-600">
                        {result.error ??
                            "The technician profile could not be loaded."}
                    </p>

                    <Link
                        href="/technicians"
                        className="mt-4 inline-block text-sm font-medium text-blue-700 hover:text-blue-800"
                    >
                        Back to technicians
                    </Link>
                </section>
            </main>
        );
    }

    const technician = result.technician;

    const updateTechnicianWithId = updateTechnicianProfile.bind(
        null,
        technician.id,
    );

    return (
        <main className="p-6">
            <section className="mx-auto max-w-3xl rounded-xl bg-white p-6 shadow-sm">
                <div className="mb-6">
                    <Link
                        href={`/technicians/${technician.id}`}
                        className="text-sm font-medium text-blue-700 hover:text-blue-800"
                    >
                        Back to technician
                    </Link>

                    <h1 className="mt-3 text-2xl font-semibold text-slate-900">
                        Edit technician
                    </h1>

                    <p className="mt-2 text-sm text-slate-600">
                        Update operational skills and availability.
                    </p>
                </div>

                <TechnicianForm
                    action={updateTechnicianWithId}
                    submitLabel="Save changes"
                    defaultValues={{
                        skills: technician.skills,
                        availability: technician.availability,
                    }}
                    linkedAccount={{
                        name: technician.user.name,
                        email: technician.user.email,
                    }}
                />
            </section>
        </main>
    );
}